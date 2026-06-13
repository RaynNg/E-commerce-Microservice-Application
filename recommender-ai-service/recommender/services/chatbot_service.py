"""
Chatbot service: RAG-style book advisory using Neo4j + Anthropic Claude.

Pipeline:
1. Search books by keyword from product-service
2. Query customer purchase history (Neo4j RATED relationships)
3. Build context for Claude
4. Call Claude API (claude-haiku-4-5-20251001)
5. Extract book_ids mentioned in reply
6. Return reply + matched book objects
"""
import os
import re
import requests

PRODUCT_SERVICE_URL = os.environ.get("PRODUCT_SERVICE_URL", "http://product-service:8000")
NEO4J_URI         = os.environ.get("NEO4J_URI",        "bolt://neo4j:7687")
NEO4J_USER        = os.environ.get("NEO4J_USER",       "neo4j")
NEO4J_PASSWORD    = os.environ.get("NEO4J_PASSWORD",   "bookstore123")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

SYSTEM_PROMPT = (
    "Bạn là trợ lý tư vấn sách của ShopMicro. "
    "Hãy tư vấn dựa trên danh sách sách có sẵn và nhu cầu khách hàng. "
    "Khi gợi ý sách, hãy đề cập tên sách cụ thể từ danh sách được cung cấp. "
    "Trả lời bằng tiếng Việt, ngắn gọn và thân thiện."
)


def _search_books(keyword: str) -> list:
    """Search books from product-service by keyword (title/author search)."""
    try:
        r = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/books/",
            params={"search": keyword, "limit": 10},
            timeout=10,
        )
        if r.status_code == 200:
            data = r.json()
            return data.get("results", data) if isinstance(data, dict) else data
    except Exception:
        pass

    # Fallback: fetch all and filter
    try:
        r = requests.get(f"{PRODUCT_SERVICE_URL}/api/books/", params={"limit": 100}, timeout=10)
        if r.status_code == 200:
            data = r.json()
            books = data.get("results", data) if isinstance(data, dict) else data
            kw = keyword.lower()
            return [b for b in books if kw in (b.get("title") or "").lower()
                    or kw in (b.get("author") or "").lower()][:10]
    except Exception:
        pass
    return []


def _get_customer_history(customer_id: int) -> list:
    """Fetch books the customer has rated from Neo4j."""
    try:
        from neo4j import GraphDatabase
        driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
        with driver.session() as session:
            result = session.run(
                """
                MATCH (c:Customer {id: $cid})-[r:RATED]->(b:Book)
                RETURN b.id AS book_id, b.title AS title, r.rating AS rating
                ORDER BY r.rating DESC LIMIT 5
                """,
                cid=str(customer_id),
            )
            history = [dict(rec) for rec in result]
        driver.close()
        return history
    except Exception:
        return []


def _build_context(books: list, history: list) -> str:
    lines = ["Danh sách sách có sẵn:"]
    for b in books:
        price = b.get("price", 0)
        lines.append(f"- [{b.get('id')}] {b.get('title')} — {b.get('author', '')} — {price:,}₫")

    if history:
        lines.append("\nLịch sử mua của khách hàng:")
        for h in history:
            lines.append(f"- {h.get('title', h.get('book_id'))} (rating: {h.get('rating')})")

    return "\n".join(lines)


def _call_claude(message: str, context: str) -> str:
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        resp = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=512,
            system=SYSTEM_PROMPT + "\n\n" + context,
            messages=[{"role": "user", "content": message}],
        )
        return resp.content[0].text
    except Exception as e:
        return _rule_based_reply(message, context)


def _rule_based_reply(message: str, context: str) -> str:
    msg = message.lower()
    if any(w in msg for w in ["python", "lập trình", "programming"]):
        return "Dựa trên yêu cầu của bạn, tôi gợi ý các sách lập trình Python từ danh sách có sẵn. Hãy xem các cuốn được liệt kê bên dưới!"
    if any(w in msg for w in ["rẻ", "giá thấp", "cheap", "affordable"]):
        return "Tôi đã lọc các sách với giá phải chăng cho bạn. Hãy tham khảo danh sách bên dưới!"
    return "Dựa trên nhu cầu của bạn, tôi gợi ý một số sách phù hợp từ kho sách của ShopMicro!"


def _extract_mentioned_books(reply: str, books: list) -> list:
    """Return books whose title appears in the reply."""
    mentioned = []
    for book in books:
        title = book.get("title", "")
        if title and title.lower() in reply.lower():
            mentioned.append({
                "book_id": book.get("id"),
                "title": title,
                "price": book.get("price", 0),
                "image_url": book.get("image_url", ""),
            })
    # If no title matches, return the first 3 found books
    if not mentioned:
        mentioned = [
            {
                "book_id": b.get("id"),
                "title": b.get("title", ""),
                "price": b.get("price", 0),
                "image_url": b.get("image_url", ""),
            }
            for b in books[:3]
        ]
    return mentioned


def handle_chatbot(message: str, customer_id: int) -> dict:
    """Main entry point for the chatbot service."""
    books = _search_books(message)

    history = []
    if customer_id:
        history = _get_customer_history(customer_id)

    context = _build_context(books, history)

    if ANTHROPIC_API_KEY:
        reply = _call_claude(message, context)
    else:
        reply = _rule_based_reply(message, context)

    mentioned_books = _extract_mentioned_books(reply, books)

    return {
        "reply": reply,
        "books": mentioned_books,
    }
