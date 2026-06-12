"""
RAG (Retrieval-Augmented Generation) service.
- sentence-transformers để embed sản phẩm (hỗ trợ tiếng Việt)
- FAISS để tìm kiếm vector similarity
- Anthropic Claude để generate câu trả lời tư vấn
"""
import os
import pickle
import numpy as np
from pathlib import Path
from typing import Optional

INDEX_DIR = Path('/app/data/faiss_index')
INDEX_DIR.mkdir(parents=True, exist_ok=True)
FAISS_INDEX_PATH = INDEX_DIR / 'products.faiss'
PRODUCT_IDS_PATH = INDEX_DIR / 'product_ids.pkl'

MODEL_NAME = 'paraphrase-multilingual-MiniLM-L12-v2'


class RAGService:
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        self._encoder = None
        self._faiss_index = None
        self._product_ids = []
        self._load_encoder()
        self._load_or_build_index()

    def _load_encoder(self):
        try:
            from sentence_transformers import SentenceTransformer
            self._encoder = SentenceTransformer(MODEL_NAME)
            print(f"[RAG] Encoder loaded: {MODEL_NAME}")
        except Exception as e:
            print(f"[RAG] Lỗi load encoder: {e}")
            self._encoder = None

    def _load_or_build_index(self):
        if FAISS_INDEX_PATH.exists() and PRODUCT_IDS_PATH.exists():
            self._load_index_from_disk()
        else:
            self.build_index()

    def build_index(self):
        try:
            import faiss
        except ImportError:
            print("[RAG] faiss-cpu chưa được cài.")
            return

        if not self._encoder:
            print("[RAG] Encoder chưa sẵn sàng, skip build index")
            return

        from recommender.models import ProductIndex
        products = list(ProductIndex.objects.all())
        if not products:
            print("[RAG] Không có sản phẩm để index. Chạy sync_product_index trước.")
            return

        texts = [p.search_text for p in products]
        ids = [p.product_id for p in products]

        print(f"[RAG] Đang embed {len(texts)} sản phẩm...")
        embeddings = self._encoder.encode(texts, show_progress_bar=True, batch_size=32)
        embeddings = embeddings.astype(np.float32)
        faiss.normalize_L2(embeddings)

        dimension = embeddings.shape[1]
        index = faiss.IndexFlatIP(dimension)
        index.add(embeddings)

        faiss.write_index(index, str(FAISS_INDEX_PATH))
        with open(PRODUCT_IDS_PATH, 'wb') as f:
            pickle.dump(ids, f)

        self._faiss_index = index
        self._product_ids = ids
        print(f"[RAG] Index build xong: {index.ntotal} vectors, dim={dimension}")

    def _load_index_from_disk(self):
        try:
            import faiss
            self._faiss_index = faiss.read_index(str(FAISS_INDEX_PATH))
            with open(PRODUCT_IDS_PATH, 'rb') as f:
                self._product_ids = pickle.load(f)
            print(f"[RAG] Loaded index từ disk: {self._faiss_index.ntotal} vectors")
        except Exception as e:
            print(f"[RAG] Lỗi load index: {e}")

    def search(self, query: str, top_k: int = 5,
               product_type: Optional[str] = None) -> list:
        if not self._encoder or not self._faiss_index:
            return self._fallback_search(query, top_k, product_type)

        try:
            import faiss
            query_vec = self._encoder.encode([query]).astype(np.float32)
            faiss.normalize_L2(query_vec)

            search_k = top_k * 4 if product_type else top_k * 2
            scores, indices = self._faiss_index.search(query_vec, min(search_k, self._faiss_index.ntotal))

            from recommender.models import ProductIndex
            results = []
            for score, idx in zip(scores[0], indices[0]):
                if idx < 0 or idx >= len(self._product_ids):
                    continue
                pid = self._product_ids[idx]
                try:
                    product = ProductIndex.objects.get(product_id=pid)
                    if product_type and product.product_type != product_type:
                        continue
                    results.append({
                        'product_id': product.product_id,
                        'name': product.name,
                        'price': int(product.price),
                        'product_type': product.product_type,
                        'score': float(score),
                        'raw_data': product.raw_data,
                    })
                    if len(results) >= top_k:
                        break
                except ProductIndex.DoesNotExist:
                    continue
            return results
        except Exception as e:
            print(f"[RAG] search error: {e}")
            return self._fallback_search(query, top_k, product_type)

    def _fallback_search(self, query: str, top_k: int, product_type: Optional[str]) -> list:
        """Keyword search fallback khi FAISS chưa sẵn sàng."""
        from recommender.models import ProductIndex
        from django.db.models import Q
        qs = ProductIndex.objects.filter(
            Q(name__icontains=query) | Q(search_text__icontains=query)
        )
        if product_type:
            qs = qs.filter(product_type=product_type)
        results = []
        for p in qs[:top_k]:
            results.append({
                'product_id': p.product_id,
                'name': p.name,
                'price': int(p.price),
                'product_type': p.product_type,
                'score': 0.5,
                'raw_data': p.raw_data,
            })
        return results

    def generate_response(self, user_message: str, retrieved_products: list,
                          customer_id: Optional[int] = None) -> str:
        api_key = os.environ.get('ANTHROPIC_API_KEY', '')
        if not api_key:
            return self._template_response(user_message, retrieved_products)

        context_lines = []
        for i, p in enumerate(retrieved_products, 1):
            raw = p.get('raw_data', {})
            detail = raw.get('detail') or {}
            price_fmt = f"{p['price']:,}đ".replace(',', '.')

            if p['product_type'] == 'book':
                line = (f"{i}. [SÁCH] {p['name']} — {price_fmt}\n"
                        f"   Tác giả: {detail.get('author', 'N/A')}, "
                        f"NXB: {detail.get('publisher', 'N/A')}, "
                        f"{detail.get('pages', '?')} trang")
            elif p['product_type'] == 'laptop':
                line = (f"{i}. [LAPTOP] {p['name']} — {price_fmt}\n"
                        f"   CPU: {detail.get('cpu', 'N/A')}, RAM: {detail.get('ram', 'N/A')}, "
                        f"GPU: {detail.get('gpu') or 'Tích hợp'}, "
                        f"Màn hình: {detail.get('display', 'N/A')}")
            elif p['product_type'] == 'fashion':
                sizes = ', '.join(detail.get('sizes') or [])
                colors = ', '.join(detail.get('colors') or [])
                line = (f"{i}. [THỜI TRANG] {p['name']} — {price_fmt}\n"
                        f"   Chất liệu: {detail.get('material', 'N/A')}, "
                        f"Size: {sizes}, Màu: {colors}")
            else:
                line = f"{i}. {p['name']} — {price_fmt}"

            context_lines.append(line)

        products_context = "\n".join(context_lines)

        system_prompt = """Bạn là trợ lý tư vấn mua sắm của ShopMicro — một sàn thương mại điện tử bán sách, laptop và quần áo.

Nhiệm vụ:
1. Hiểu nhu cầu khách hàng từ câu hỏi
2. Dựa trên danh sách sản phẩm có sẵn, tư vấn phù hợp nhất
3. Giải thích ngắn gọn tại sao sản phẩm đó phù hợp
4. Nếu có nhiều lựa chọn, so sánh ưu/nhược điểm

Quy tắc:
- Chỉ đề xuất sản phẩm trong danh sách được cung cấp
- Trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp
- Ngắn gọn: tối đa 3-4 câu per sản phẩm
- Nếu không có sản phẩm phù hợp, nói thật và gợi ý từ khóa khác"""

        user_content = f"""Khách hàng hỏi: "{user_message}"

Danh sách sản phẩm có sẵn:
{products_context}

Hãy tư vấn cho khách hàng."""

        try:
            import anthropic
            client = anthropic.Anthropic(api_key=api_key)
            message = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=1024,
                system=system_prompt,
                messages=[{"role": "user", "content": user_content}]
            )
            return message.content[0].text
        except Exception as e:
            print(f"[RAG] Lỗi gọi Anthropic API: {e}")
            return self._template_response(user_message, retrieved_products)

    def _template_response(self, query: str, products: list) -> str:
        if not products:
            return "Xin lỗi, tôi không tìm thấy sản phẩm phù hợp. Bạn thử từ khóa khác nhé?"
        lines = [f"Dựa trên yêu cầu của bạn, tôi gợi ý:\n"]
        for p in products[:3]:
            price_fmt = f"{p['price']:,}đ".replace(',', '.')
            emoji = {'book': '📚', 'laptop': '💻', 'fashion': '👕'}.get(p['product_type'], '🛍️')
            lines.append(f"{emoji} {p['name']} — {price_fmt}")
        return "\n".join(lines)
