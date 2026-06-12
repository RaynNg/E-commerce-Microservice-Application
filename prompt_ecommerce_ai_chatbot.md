# PROMPT V2 — Nâng cấp BookStore → Multi-Product E-Commerce + AI Chatbot thực sự

# Repo: https://github.com/RaynNg/E-commerce-Microservice-Application

# Dán toàn bộ file này vào chat mới, làm từng TASK một.

---

## BỐI CẢNH ĐỦ ĐỂ LÀM VIỆC

Hệ thống hiện tại là **BookStore Microservices** đang chạy được với:

- 12 Django services + 2 React frontends + Neo4j + RabbitMQ
- Tất cả backend dùng Django DRF + PostgreSQL (mỗi service 1 DB riêng)
- AI service (`recommender-ai-service`, port 8011) dùng collaborative filtering từ ratings, **không có chatbot**
- `book-service` (port 8005) + `catalog-service` (port 8004) quản lý sản phẩm/danh mục

**3 vấn đề cần giải quyết:**

| #   | Vấn đề                                                                    | Mức độ                          |
| --- | ------------------------------------------------------------------------- | ------------------------------- |
| 1   | Chỉ bán sách, cần mở rộng thành 3 loại: Sách + Laptop + Quần áo           | Lớn — đụng đến model, seed, API |
| 2   | DB đang dùng seed data (SQLite hoặc in-memory), chưa dùng PostgreSQL thật | Cần fix config                  |
| 3   | AI chỉ recommend theo hành vi, không hiểu được câu hỏi ngôn ngữ tự nhiên  | Cần thêm RAG + Chatbot          |

---

## PHẦN 1 — HIỂU CẤU TRÚC CODE TRƯỚC KHI LÀM

Trước khi bắt đầu bất kỳ task nào, hãy đọc và phân tích các file sau. Nếu không có công cụ đọc file, hỏi tôi paste nội dung.

```
Cần đọc:
1. book-service/books/models.py          ← hiểu Product model hiện tại
2. catalog-service/catalogs/models.py    ← hiểu Category model hiện tại
3. book-service/books/serializers.py     ← hiểu API response format
4. book-service/books/views.py           ← hiểu CRUD pattern
5. recommender-ai-service/recommender/models.py   ← hiểu data model của AI
6. recommender-ai-service/recommender/views.py    ← hiểu recommend logic hiện tại
7. docker-compose.yml                    ← đã có (xem phần bối cảnh)
```

**Pattern chuẩn mọi Django service trong project này:**

```
{service}/
├── {app}/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── management/commands/seed_{model}.py
├── {project}/
│   ├── settings.py
│   └── urls.py
├── Dockerfile
└── requirements.txt
```

---

## TASK 1 — Mở rộng Product sang 3 loại hàng (Sách, Laptop, Quần áo)

### Chiến lược kiến trúc

Dựa trên đặc tả DDD trong tiểu luận và cấu trúc hiện có:

```
KHÔNG tạo service mới cho mỗi loại hàng.
Thay vào đó: mở rộng book-service → product-service
(đổi tên service hoặc thêm models mới trong cùng service)

Lý do: Giữ nguyên cart/order/recommender đang hoạt động.
Chỉ cần book-service trả về đúng loại sản phẩm.
```

### 1A. Cập nhật `catalog-service` — Thêm categories mới

**File cần sửa: `catalog-service/catalogs/models.py`**

Hiện tại model Catalog chỉ có `name` và `description`. Cần thêm `product_type` để phân loại:

```python
# catalog-service/catalogs/models.py
class Catalog(models.Model):
    PRODUCT_TYPES = [
        ('book', 'Sách'),
        ('laptop', 'Laptop & Thiết bị điện tử'),
        ('fashion', 'Thời trang'),
    ]
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    product_type = models.CharField(
        max_length=20,
        choices=PRODUCT_TYPES,
        default='book'
    )
    image_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'catalog'

    def __str__(self):
        return f"{self.name} ({self.product_type})"
```

**Migration:**

```bash
docker-compose exec catalog-service python manage.py makemigrations
docker-compose exec catalog-service python manage.py migrate
```

**Seed command: `catalog-service/catalogs/management/commands/seed_catalogs.py`**

Tạo đầy đủ categories cho 3 loại hàng:

```python
# Sách (book):
BOOK_CATEGORIES = [
    {"name": "Lập trình & Công nghệ", "description": "Sách về Python, Java, Web, AI..."},
    {"name": "Khoa học & Tự nhiên", "description": "Vật lý, Hóa học, Sinh học..."},
    {"name": "Kinh tế & Kinh doanh", "description": "Quản trị, Marketing, Tài chính..."},
    {"name": "Văn học trong nước", "description": "Tiểu thuyết, truyện ngắn Việt Nam"},
    {"name": "Văn học nước ngoài", "description": "Dịch phẩm nổi tiếng thế giới"},
    {"name": "Kỹ năng sống", "description": "Phát triển bản thân, tư duy tích cực"},
    {"name": "Lịch sử & Địa lý", "description": "Lịch sử Việt Nam và thế giới"},
]

# Laptop (laptop):
LAPTOP_CATEGORIES = [
    {"name": "Laptop Gaming", "description": "RTX series, hiệu năng cao cho game"},
    {"name": "Laptop Văn phòng", "description": "Mỏng nhẹ, pin trâu, office work"},
    {"name": "Laptop Đồ họa", "description": "Màn hình màu chuẩn, GPU mạnh"},
    {"name": "Laptop Sinh viên", "description": "Giá tốt, đủ dùng cho học tập"},
    {"name": "MacBook", "description": "Apple MacBook Air và MacBook Pro"},
    {"name": "Phụ kiện Laptop", "description": "Chuột, bàn phím, túi, đế tản nhiệt"},
]

# Quần áo (fashion):
FASHION_CATEGORIES = [
    {"name": "Áo nam", "description": "Áo thun, áo sơ mi, áo polo nam"},
    {"name": "Quần nam", "description": "Quần jean, kaki, short nam"},
    {"name": "Áo nữ", "description": "Áo thun, áo sơ mi, blouse nữ"},
    {"name": "Quần & Váy nữ", "description": "Quần jean, váy đầm, chân váy"},
    {"name": "Đồ đi biển", "description": "Áo bơi, short bơi, đồ resort"},
    {"name": "Giày dép", "description": "Sneaker, sandal, giày da"},
    {"name": "Phụ kiện thời trang", "description": "Túi xách, thắt lưng, mũ nón"},
]
```

---

### 1B. Cập nhật `book-service` → `product-service` (mở rộng model)

**File cần sửa: `book-service/books/models.py`**

Thêm model kế thừa theo đặc tả DDD (OneToOneField về Product cha):

```python
# book-service/books/models.py

class Product(models.Model):
    """
    Base product model — đây là Product cha chung cho mọi loại hàng.
    Theo đặc tả DDD: mỗi sản phẩm thuộc 1 catalog, có giá, tồn kho.
    """
    PRODUCT_TYPES = [
        ('book', 'Sách'),
        ('laptop', 'Laptop'),
        ('fashion', 'Quần áo'),
    ]
    catalog_id = models.IntegerField()        # FK đến catalog-service (không dùng Django FK thật)
    product_type = models.CharField(max_length=20, choices=PRODUCT_TYPES)
    name = models.CharField(max_length=500)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=0)  # VNĐ
    stock = models.IntegerField(default=0)
    image_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'product'

    def __str__(self):
        return f"[{self.product_type}] {self.name}"


class Book(models.Model):
    """Chi tiết sách — kế thừa từ Product (OneToOne)"""
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='book_detail')
    author = models.CharField(max_length=300)
    publisher = models.CharField(max_length=300, blank=True)
    isbn = models.CharField(max_length=20, blank=True)
    pages = models.IntegerField(null=True, blank=True)
    language = models.CharField(max_length=50, default='Tiếng Việt')
    published_year = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'book_detail'


class Laptop(models.Model):
    """Chi tiết laptop — kế thừa từ Product (OneToOne)"""
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='laptop_detail')
    brand = models.CharField(max_length=100)      # ASUS, Acer, Dell, Apple...
    cpu = models.CharField(max_length=200)         # Intel i7-13700H
    ram = models.CharField(max_length=50)          # 16GB DDR5
    storage = models.CharField(max_length=100)     # 512GB SSD
    display = models.CharField(max_length=100)     # 15.6" FHD 144Hz
    gpu = models.CharField(max_length=200, blank=True)  # RTX 4060
    battery = models.CharField(max_length=100, blank=True)  # 72Wh
    weight = models.FloatField(null=True, blank=True)       # kg
    os = models.CharField(max_length=100, default='Windows 11')
    warranty_months = models.IntegerField(default=12)

    class Meta:
        db_table = 'laptop_detail'


class Fashion(models.Model):
    """Chi tiết quần áo — kế thừa từ Product (OneToOne)"""
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='fashion_detail')
    brand = models.CharField(max_length=100, blank=True)
    sizes = models.JSONField(default=list)        # ["S", "M", "L", "XL", "XXL"]
    colors = models.JSONField(default=list)       # ["Đen", "Trắng", "Xanh navy"]
    material = models.CharField(max_length=200, blank=True)  # Cotton 100%, Polyester...
    gender = models.CharField(
        max_length=20,
        choices=[('male', 'Nam'), ('female', 'Nữ'), ('unisex', 'Unisex')],
        default='unisex'
    )
    season = models.CharField(max_length=100, blank=True)  # Hè, Đông, 4 mùa

    class Meta:
        db_table = 'fashion_detail'
```

**Serializers — `book-service/books/serializers.py`**

```python
class ProductSerializer(serializers.ModelSerializer):
    detail = serializers.SerializerMethodField()
    catalog_name = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'catalog_id', 'product_type', 'name', 'description',
                  'price', 'stock', 'image_url', 'is_active', 'detail',
                  'catalog_name', 'created_at']

    def get_detail(self, obj):
        if obj.product_type == 'book' and hasattr(obj, 'book_detail'):
            return BookDetailSerializer(obj.book_detail).data
        elif obj.product_type == 'laptop' and hasattr(obj, 'laptop_detail'):
            return LaptopDetailSerializer(obj.laptop_detail).data
        elif obj.product_type == 'fashion' and hasattr(obj, 'fashion_detail'):
            return FashionDetailSerializer(obj.fashion_detail).data
        return {}

    def get_catalog_name(self, obj):
        # Gọi catalog-service để lấy tên catalog
        # Cache trong memory nếu có thể
        return None  # Implement sau nếu cần


class BookDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        exclude = ['id', 'product']

class LaptopDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Laptop
        exclude = ['id', 'product']

class FashionDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fashion
        exclude = ['id', 'product']
```

**API Endpoints mới — `book-service/books/views.py`**

Thêm filter theo `product_type` và `catalog_id`:

```
GET /api/products/                          — tất cả sản phẩm
GET /api/products/?product_type=laptop      — chỉ laptop
GET /api/products/?product_type=fashion     — chỉ quần áo
GET /api/products/?catalog_id=3             — theo danh mục
GET /api/products/search/?q=asus            — tìm kiếm
GET /api/products/{id}/                     — chi tiết
POST /api/products/                         — tạo mới (staff)
```

**URL routing — đổi prefix từ `/api/books/` → `/api/products/`** trong:

- `book-service/books/urls.py`
- `api-gateway/gateway/views.py` (thêm route `/api/products/`)

---

### 1C. Seed data thực tế — 3 loại hàng

**File: `book-service/books/management/commands/seed_products.py`**

```python
"""
Seed 100+ sản phẩm cho 3 loại hàng.
Chạy: docker-compose exec book-service python manage.py seed_products
"""

BOOKS_DATA = [
    # Lập trình & Công nghệ (catalog_id=1)
    {"name": "Python Crash Course (3rd Edition)", "price": 280000, "stock": 50,
     "author": "Eric Matthes", "publisher": "No Starch Press", "isbn": "9781718502703",
     "pages": 552, "language": "Tiếng Anh", "published_year": 2023},
    {"name": "Clean Code - Mã sạch", "price": 199000, "stock": 30,
     "author": "Robert C. Martin", "publisher": "NXB Lao Động", "isbn": "9786045659501",
     "pages": 431, "language": "Tiếng Việt", "published_year": 2021},
    {"name": "Học Machine Learning với Python", "price": 249000, "stock": 40,
     "author": "Aurélien Géron", "publisher": "NXB Khoa học Kỹ thuật",
     "pages": 740, "language": "Tiếng Việt"},
    {"name": "JavaScript: The Good Parts", "price": 185000, "stock": 25,
     "author": "Douglas Crockford", "publisher": "O'Reilly", "pages": 176},
    {"name": "Thiết kế hệ thống phần mềm", "price": 320000, "stock": 35,
     "author": "Alex Xu", "publisher": "NXB Trẻ", "pages": 400, "language": "Tiếng Việt"},
    # Khoa học & Tự nhiên (catalog_id=2)
    {"name": "Lược sử thời gian", "price": 135000, "stock": 60,
     "author": "Stephen Hawking", "publisher": "NXB Trẻ", "pages": 232, "language": "Tiếng Việt"},
    {"name": "Sapiens: Lược sử loài người", "price": 168000, "stock": 80,
     "author": "Yuval Noah Harari", "publisher": "NXB Tri Thức", "pages": 559},
    {"name": "Vũ trụ trong vỏ hạt dẻ", "price": 145000, "stock": 45,
     "author": "Stephen Hawking", "publisher": "NXB Trẻ", "pages": 224},
    # ... thêm đủ 30+ books
]

LAPTOPS_DATA = [
    # Laptop Gaming (catalog_id=8)
    {"name": "ASUS ROG Strix G16 2024", "price": 35990000, "stock": 15,
     "brand": "ASUS", "cpu": "Intel Core i9-14900HX", "ram": "16GB DDR5",
     "storage": "1TB SSD NVMe", "display": "16\" QHD+ 240Hz", "gpu": "RTX 4070 8GB",
     "battery": "90Wh", "weight": 2.5, "os": "Windows 11 Home", "warranty_months": 24},
    {"name": "ASUS ROG Zephyrus G14 2024", "price": 42990000, "stock": 10,
     "brand": "ASUS", "cpu": "AMD Ryzen 9 8945HS", "ram": "32GB LPDDR5X",
     "storage": "1TB SSD", "display": "14\" 2.8K 120Hz OLED", "gpu": "RTX 4070 8GB",
     "battery": "73Wh", "weight": 1.65, "warranty_months": 24},
    {"name": "Acer Nitro 5 AN515 2024", "price": 18990000, "stock": 25,
     "brand": "Acer", "cpu": "Intel Core i5-13500H", "ram": "16GB DDR5",
     "storage": "512GB SSD", "display": "15.6\" FHD 144Hz", "gpu": "RTX 4050 6GB",
     "battery": "57.5Wh", "weight": 2.2, "warranty_months": 12},
    {"name": "Dell Gaming G15 5530", "price": 24990000, "stock": 18,
     "brand": "Dell", "cpu": "Intel Core i7-13650HX", "ram": "16GB DDR5",
     "storage": "512GB SSD", "display": "15.6\" FHD 165Hz", "gpu": "RTX 4060 8GB",
     "warranty_months": 12},
    {"name": "Lenovo LOQ 15IAX9", "price": 19990000, "stock": 20,
     "brand": "Lenovo", "cpu": "Intel Core i5-12450HX", "ram": "16GB DDR5",
     "storage": "512GB SSD", "display": "15.6\" FHD 144Hz", "gpu": "RTX 4050 6GB",
     "warranty_months": 12},
    # Laptop Văn phòng (catalog_id=9)
    {"name": "MacBook Air M3 13\"", "price": 28990000, "stock": 20,
     "brand": "Apple", "cpu": "Apple M3 8-core", "ram": "8GB Unified",
     "storage": "256GB SSD", "display": "13.6\" Liquid Retina", "gpu": "10-core GPU",
     "battery": "52.6Wh", "weight": 1.24, "os": "macOS Sonoma", "warranty_months": 12},
    {"name": "MacBook Pro M3 Pro 14\"", "price": 52990000, "stock": 8,
     "brand": "Apple", "cpu": "Apple M3 Pro 11-core", "ram": "18GB Unified",
     "storage": "512GB SSD", "display": "14.2\" Liquid Retina XDR", "gpu": "14-core GPU",
     "weight": 1.61, "os": "macOS Sonoma", "warranty_months": 12},
    {"name": "Dell XPS 13 Plus 9320", "price": 32990000, "stock": 12,
     "brand": "Dell", "cpu": "Intel Core i7-1260P", "ram": "16GB LPDDR5",
     "storage": "512GB SSD", "display": "13.4\" FHD+ OLED Touch",
     "weight": 1.26, "warranty_months": 12},
    # ... thêm đủ 30+ laptops
]

FASHION_DATA = [
    # Áo nam (catalog_id=14)
    {"name": "Áo thun nam basic cotton trắng", "price": 149000, "stock": 100,
     "brand": "Local Brand VN", "sizes": ["S", "M", "L", "XL", "XXL"],
     "colors": ["Trắng", "Đen", "Xám"], "material": "100% Cotton", "gender": "male"},
    {"name": "Áo polo nam Lacoste slim fit", "price": 890000, "stock": 30,
     "brand": "Lacoste", "sizes": ["M", "L", "XL"],
     "colors": ["Xanh navy", "Trắng", "Đỏ"], "material": "Piqué cotton", "gender": "male"},
    {"name": "Áo sơ mi nam Oxford trắng", "price": 350000, "stock": 50,
     "brand": "Owen", "sizes": ["S", "M", "L", "XL"],
     "colors": ["Trắng", "Xanh nhạt"], "material": "Cotton pha", "gender": "male"},
    # Đồ đi biển (catalog_id=18)
    {"name": "Quần short bơi nam tropical", "price": 199000, "stock": 80,
     "brand": "Speedo", "sizes": ["S", "M", "L", "XL"],
     "colors": ["Xanh biển", "Cam", "Đen"], "material": "Polyester nhanh khô",
     "gender": "male", "season": "Hè"},
    {"name": "Áo bơi nữ 1 mảnh UPF50+", "price": 350000, "stock": 60,
     "brand": "Arena", "sizes": ["XS", "S", "M", "L"],
     "colors": ["Đen", "Xanh navy", "Hồng"], "material": "Nylon Lycra",
     "gender": "female", "season": "Hè"},
    {"name": "Áo sơ mi đi biển unisex linen", "price": 285000, "stock": 70,
     "brand": "Routine", "sizes": ["S", "M", "L", "XL", "XXL"],
     "colors": ["Trắng", "Kem", "Xanh pastel"], "material": "Linen 100%",
     "gender": "unisex", "season": "Hè"},
    {"name": "Set đồ resort nữ (áo + quần)", "price": 520000, "stock": 40,
     "brand": "YODY", "sizes": ["S", "M", "L"],
     "colors": ["Trắng hoa", "Be hoa", "Xanh sọc"], "material": "Viscose",
     "gender": "female", "season": "Hè"},
    # ... thêm đủ 30+ fashion items
]
```

---

### 1D. Cập nhật `api-gateway` — thêm routes mới

**File: `api-gateway/gateway/views.py`** (hoặc urls.py tùy cách gateway được implement)

Thêm routes:

```python
# Thêm vào dict URL_MAP (hoặc tương đương):
"/api/products/": "BOOK_SERVICE_URL",   # route mới cho multi-product
"/api/books/": "BOOK_SERVICE_URL",       # giữ backward compat
"/api/catalogs/": "CATALOG_SERVICE_URL",
```

---

## TASK 2 — Fix PostgreSQL (đang dùng seed/SQLite → chuyển sang PostgreSQL thật)

### Chẩn đoán vấn đề

Kiểm tra `book-service/{project}/settings.py`. Nếu thấy:

```python
# Dấu hiệu đang dùng SQLite:
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

Hoặc không có env variable `DB_HOST` → đó là vấn đề.

### Fix settings.py cho TẤT CẢ services

Áp dụng template này vào `settings.py` của **từng service**:

```python
import os

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'default_db'),
        'USER': os.environ.get('DB_USER', 'postgres'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'postgres'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
        'OPTIONS': {
            'connect_timeout': 10,
        },
        'CONN_MAX_AGE': 60,  # connection pooling
    }
}
```

**Thêm `psycopg2-binary` vào `requirements.txt` của từng service:**

```
psycopg2-binary==2.9.9
```

**Entrypoint — `entrypoint.sh` (đã có ở root, kiểm tra và cập nhật):**

```bash
#!/bin/bash
set -e

echo "Waiting for PostgreSQL..."
while ! pg_isready -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" 2>/dev/null; do
    sleep 1
done
echo "PostgreSQL is ready!"

python manage.py migrate --run-syncdb
python manage.py runserver 0.0.0.0:8000
```

**Verify sau khi fix:**

```bash
docker-compose up -d postgres-book
docker-compose up -d book-service
docker-compose exec book-service python manage.py dbshell
# Nếu vào được PostgreSQL shell → thành công
```

---

## TASK 3 — AI Chatbot tư vấn sản phẩm (RAG + Anthropic Claude)

Đây là task quan trọng nhất. Hiện tại `recommender-ai-service` chỉ có:

- Collaborative filtering từ ratings → recommend book_id
- Không có chatbot, không hiểu ngôn ngữ tự nhiên

Cần thêm: **RAG Pipeline + Chatbot endpoint** theo đặc tả tiểu luận.

### 3A. Cập nhật model — thêm ProductIndex để index sản phẩm cho RAG

**File: `recommender-ai-service/recommender/models.py`** — thêm:

```python
class ProductIndex(models.Model):
    """
    Bảng index sản phẩm cho RAG — lưu text representation để search.
    Sync từ book-service (product-service) khi có sản phẩm mới.
    """
    product_id = models.IntegerField(unique=True)
    product_type = models.CharField(max_length=20)  # book, laptop, fashion
    name = models.CharField(max_length=500)
    description = models.TextField()
    price = models.DecimalField(max_digits=12, decimal_places=0)
    catalog_id = models.IntegerField()
    catalog_name = models.CharField(max_length=255, blank=True)
    # Text đã được concat để embed:
    search_text = models.TextField()
    # Vector embedding lưu dưới dạng JSON array (FAISS index riêng):
    embedding_updated_at = models.DateTimeField(null=True, blank=True)
    raw_data = models.JSONField(default=dict)  # lưu detail (specs laptop, sizes quần áo...)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'product_index'

    def __str__(self):
        return f"[{self.product_type}] {self.name}"


class ChatHistory(models.Model):
    """Lưu lịch sử chat để improve chatbot sau này"""
    customer_id = models.IntegerField()
    message = models.TextField()
    response = models.TextField()
    products_recommended = models.JSONField(default=list)  # [product_id, ...]
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chat_history'
```

### 3B. Management command — sync products vào index

**File: `recommender-ai-service/recommender/management/commands/sync_product_index.py`**

```python
"""
Sync sản phẩm từ book-service/product-service vào ProductIndex.
Chạy: python manage.py sync_product_index

Cũng chạy tự động khi startup (thêm vào entrypoint sau build_kb_graph).
"""
import os
import requests
from django.core.management.base import BaseCommand
from recommender.models import ProductIndex


class Command(BaseCommand):
    help = 'Sync products from product-service into local ProductIndex'

    def add_arguments(self, parser):
        parser.add_argument('--rebuild', action='store_true',
                          help='Xóa index cũ và build lại từ đầu')

    def handle(self, *args, **options):
        book_service_url = os.environ.get('BOOK_SERVICE_URL', 'http://book-service:8000')

        if options['rebuild']:
            ProductIndex.objects.all().delete()
            self.stdout.write('Đã xóa index cũ.')

        # Fetch tất cả products
        try:
            response = requests.get(f"{book_service_url}/api/products/", timeout=30)
            products = response.json()
            if isinstance(products, dict):  # paginated response
                products = products.get('results', [])
        except Exception as e:
            self.stderr.write(f"Lỗi khi fetch products: {e}")
            return

        created = 0
        updated = 0
        for p in products:
            detail = p.get('detail', {}) or {}
            # Build search_text — đây là text sẽ được embed
            search_parts = [p['name'], p.get('description', '')]
            if p['product_type'] == 'book':
                search_parts += [
                    detail.get('author', ''),
                    detail.get('publisher', ''),
                    f"ISBN {detail.get('isbn', '')}",
                ]
            elif p['product_type'] == 'laptop':
                search_parts += [
                    detail.get('brand', ''),
                    detail.get('cpu', ''),
                    detail.get('ram', ''),
                    detail.get('gpu', ''),
                    f"màn hình {detail.get('display', '')}",
                    f"bảo hành {detail.get('warranty_months', 12)} tháng",
                ]
            elif p['product_type'] == 'fashion':
                sizes = ', '.join(detail.get('sizes', []))
                colors = ', '.join(detail.get('colors', []))
                search_parts += [
                    detail.get('brand', ''),
                    detail.get('material', ''),
                    f"size: {sizes}",
                    f"màu: {colors}",
                    detail.get('season', ''),
                    {'male': 'nam', 'female': 'nữ', 'unisex': 'unisex'}.get(
                        detail.get('gender', 'unisex'), ''),
                ]
            search_text = ' | '.join(filter(None, search_parts))

            obj, created_flag = ProductIndex.objects.update_or_create(
                product_id=p['id'],
                defaults={
                    'product_type': p['product_type'],
                    'name': p['name'],
                    'description': p.get('description', ''),
                    'price': p['price'],
                    'catalog_id': p['catalog_id'],
                    'search_text': search_text,
                    'raw_data': p,
                }
            )
            if created_flag:
                created += 1
            else:
                updated += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Sync xong: {created} mới, {updated} cập nhật. '
                f'Tổng {ProductIndex.objects.count()} sản phẩm.'
            )
        )
```

### 3C. RAG Service với FAISS + Anthropic

**File: `recommender-ai-service/recommender/services/rag_service.py`**

```python
"""
RAG (Retrieval-Augmented Generation) service.
- Dùng sentence-transformers để embed sản phẩm
- FAISS để tìm kiếm vector similarity
- Anthropic Claude để generate câu trả lời tư vấn
"""
import os
import json
import pickle
import numpy as np
from pathlib import Path
from typing import Optional

import anthropic
from sentence_transformers import SentenceTransformer

from recommender.models import ProductIndex

# Path lưu FAISS index
INDEX_DIR = Path('/app/data/faiss_index')
INDEX_DIR.mkdir(parents=True, exist_ok=True)
FAISS_INDEX_PATH = INDEX_DIR / 'products.faiss'
PRODUCT_IDS_PATH = INDEX_DIR / 'product_ids.pkl'

MODEL_NAME = 'paraphrase-multilingual-MiniLM-L12-v2'  # Hỗ trợ tiếng Việt!


class RAGService:
    _instance = None
    _encoder = None
    _faiss_index = None
    _product_ids = []

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
        """Load sentence transformer model (download lần đầu, cache sau)"""
        try:
            self._encoder = SentenceTransformer(MODEL_NAME)
        except Exception as e:
            print(f"[RAG] Lỗi load encoder: {e}")
            self._encoder = None

    def _load_or_build_index(self):
        """Load FAISS index từ disk, hoặc build mới nếu chưa có"""
        if FAISS_INDEX_PATH.exists() and PRODUCT_IDS_PATH.exists():
            self._load_index_from_disk()
        else:
            self.build_index()

    def build_index(self):
        """Build FAISS index từ ProductIndex table"""
        try:
            import faiss
        except ImportError:
            print("[RAG] faiss-cpu chưa được cài. Thêm vào requirements.txt")
            return

        if not self._encoder:
            print("[RAG] Encoder chưa sẵn sàng, skip build index")
            return

        products = list(ProductIndex.objects.filter())
        if not products:
            print("[RAG] Không có sản phẩm để index. Chạy sync_product_index trước.")
            return

        texts = [p.search_text for p in products]
        ids = [p.product_id for p in products]

        print(f"[RAG] Đang embed {len(texts)} sản phẩm...")
        embeddings = self._encoder.encode(texts, show_progress_bar=True, batch_size=32)
        embeddings = embeddings.astype(np.float32)
        faiss.normalize_L2(embeddings)  # Cosine similarity

        dimension = embeddings.shape[1]
        index = faiss.IndexFlatIP(dimension)  # Inner product = cosine sau normalize
        index.add(embeddings)

        # Lưu xuống disk
        faiss.write_index(index, str(FAISS_INDEX_PATH))
        with open(PRODUCT_IDS_PATH, 'wb') as f:
            pickle.dump(ids, f)

        self._faiss_index = index
        self._product_ids = ids
        print(f"[RAG] Index đã build xong: {index.ntotal} vectors, dim={dimension}")

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
               product_type: Optional[str] = None) -> list[dict]:
        """
        Tìm sản phẩm liên quan nhất với query.
        Args:
            query: câu hỏi hoặc từ khóa từ người dùng
            top_k: số sản phẩm trả về
            product_type: lọc theo loại ('book', 'laptop', 'fashion')
        Returns:
            list of {"product_id", "name", "price", "product_type", "score", ...}
        """
        if not self._encoder or not self._faiss_index:
            return []

        import faiss as _faiss
        import numpy as np

        query_vec = self._encoder.encode([query]).astype(np.float32)
        _faiss.normalize_L2(query_vec)

        # Tìm nhiều hơn nếu cần filter
        search_k = top_k * 3 if product_type else top_k
        scores, indices = self._faiss_index.search(query_vec, search_k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0 or idx >= len(self._product_ids):
                continue
            product_id = self._product_ids[idx]
            try:
                product = ProductIndex.objects.get(product_id=product_id)
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

    def generate_response(self, user_message: str, retrieved_products: list[dict],
                          customer_id: Optional[int] = None) -> str:
        """
        Gọi Anthropic Claude để sinh câu trả lời tư vấn dựa trên sản phẩm tìm được.
        """
        api_key = os.environ.get('ANTHROPIC_API_KEY', '')
        if not api_key:
            # Fallback: trả về response template nếu không có API key
            return self._template_response(user_message, retrieved_products)

        # Build context từ sản phẩm tìm được
        context_lines = []
        for i, p in enumerate(retrieved_products, 1):
            raw = p.get('raw_data', {})
            detail = raw.get('detail', {}) or {}
            price_fmt = f"{p['price']:,}đ".replace(',', '.')

            if p['product_type'] == 'book':
                line = (f"{i}. [SÁCH] {p['name']} — {price_fmt}\n"
                       f"   Tác giả: {detail.get('author', 'N/A')}, "
                       f"NXB: {detail.get('publisher', 'N/A')}, "
                       f"{detail.get('pages', '?')} trang")
            elif p['product_type'] == 'laptop':
                line = (f"{i}. [LAPTOP] {p['name']} — {price_fmt}\n"
                       f"   CPU: {detail.get('cpu', 'N/A')}, RAM: {detail.get('ram', 'N/A')}, "
                       f"GPU: {detail.get('gpu', 'N/A') or 'Tích hợp'}, "
                       f"Màn hình: {detail.get('display', 'N/A')}")
            elif p['product_type'] == 'fashion':
                sizes = ', '.join(detail.get('sizes', []) or [])
                colors = ', '.join(detail.get('colors', []) or [])
                line = (f"{i}. [THỜI TRANG] {p['name']} — {price_fmt}\n"
                       f"   Chất liệu: {detail.get('material', 'N/A')}, "
                       f"Size: {sizes}, Màu: {colors}")
            else:
                line = f"{i}. {p['name']} — {price_fmt}"

            context_lines.append(line)

        products_context = "\n".join(context_lines)

        system_prompt = """Bạn là trợ lý tư vấn mua sắm của ShopMicro — một sàn thương mại điện tử bán sách, laptop và quần áo.

Nhiệm vụ của bạn:
1. Hiểu nhu cầu của khách hàng từ câu hỏi
2. Dựa trên danh sách sản phẩm có sẵn, tư vấn phù hợp nhất
3. Giải thích ngắn gọn tại sao sản phẩm đó phù hợp
4. Nếu có nhiều lựa chọn, so sánh ưu/nhược điểm

Quy tắc:
- Chỉ đề xuất sản phẩm có trong danh sách được cung cấp
- Trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp
- Ngắn gọn: tối đa 3-4 câu per sản phẩm
- Nếu không có sản phẩm phù hợp, thành thật nói vậy và gợi ý tìm kiếm từ khóa khác"""

        user_content = f"""Khách hàng hỏi: "{user_message}"

Danh sách sản phẩm có sẵn trong kho:
{products_context}

Hãy tư vấn cho khách hàng dựa trên các sản phẩm trên."""

        try:
            client = anthropic.Anthropic(api_key=api_key)
            message = client.messages.create(
                model="claude-haiku-4-5-20251001",  # Nhanh và rẻ nhất
                max_tokens=1024,
                system=system_prompt,
                messages=[{"role": "user", "content": user_content}]
            )
            return message.content[0].text
        except Exception as e:
            print(f"[RAG] Lỗi gọi Anthropic API: {e}")
            return self._template_response(user_message, retrieved_products)

    def _template_response(self, query: str, products: list[dict]) -> str:
        """Fallback khi không có API key hoặc API lỗi"""
        if not products:
            return "Xin lỗi, tôi không tìm thấy sản phẩm phù hợp với yêu cầu của bạn. Bạn có thể thử với từ khóa khác không?"

        lines = [f"Dựa trên yêu cầu '{query}', tôi gợi ý các sản phẩm sau:\n"]
        for p in products[:3]:
            price_fmt = f"{p['price']:,}đ".replace(',', '.')
            lines.append(f"• {p['name']} — {price_fmt}")
        return "\n".join(lines)
```

### 3D. Chatbot View + URL

**Thêm vào `recommender-ai-service/recommender/views.py`:**

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from recommender.services.rag_service import RAGService


class ChatbotView(APIView):
    """
    POST /api/chatbot/
    Body: {"message": "tôi muốn mua laptop asus gaming dưới 20 triệu", "customer_id": 1}
    Response: {"reply": "...", "products": [...]}
    """
    def post(self, request):
        message = request.data.get('message', '').strip()
        customer_id = request.data.get('customer_id')

        if not message:
            return Response(
                {'error': 'Vui lòng nhập câu hỏi.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Detect product_type từ message để lọc kết quả
        product_type_filter = None
        msg_lower = message.lower()
        if any(w in msg_lower for w in ['sách', 'book', 'tác giả', 'đọc', 'xuất bản']):
            product_type_filter = 'book'
        elif any(w in msg_lower for w in ['laptop', 'máy tính', 'macbook', 'gaming pc', 'máy xách tay']):
            product_type_filter = 'laptop'
        elif any(w in msg_lower for w in ['áo', 'quần', 'váy', 'giày', 'thời trang', 'mặc', 'đi biển', 'quần áo']):
            product_type_filter = 'fashion'

        rag = RAGService.get_instance()

        # 1. Retrieve — tìm sản phẩm liên quan
        retrieved = rag.search(
            query=message,
            top_k=5,
            product_type=product_type_filter
        )

        # 2. Generate — sinh câu trả lời tư vấn
        reply = rag.generate_response(
            user_message=message,
            retrieved_products=retrieved,
            customer_id=customer_id
        )

        # 3. Format response
        products_out = [
            {
                'product_id': p['product_id'],
                'name': p['name'],
                'price': p['price'],
                'product_type': p['product_type'],
            }
            for p in retrieved
        ]

        # Lưu lịch sử chat (nếu có customer_id)
        if customer_id:
            from recommender.models import ChatHistory
            ChatHistory.objects.create(
                customer_id=customer_id,
                message=message,
                response=reply,
                products_recommended=[p['product_id'] for p in retrieved]
            )

        return Response({
            'reply': reply,
            'products': products_out,
            'detected_type': product_type_filter,
        })


class ProductIndexStatusView(APIView):
    """GET /api/chatbot/status/ — kiểm tra trạng thái RAG"""
    def get(self, request):
        from recommender.models import ProductIndex
        from recommender.services.rag_service import FAISS_INDEX_PATH

        return Response({
            'product_index_count': ProductIndex.objects.count(),
            'faiss_index_exists': FAISS_INDEX_PATH.exists(),
            'by_type': {
                'book': ProductIndex.objects.filter(product_type='book').count(),
                'laptop': ProductIndex.objects.filter(product_type='laptop').count(),
                'fashion': ProductIndex.objects.filter(product_type='fashion').count(),
            }
        })
```

**Thêm vào `recommender-ai-service/recommender/urls.py`:**

```python
urlpatterns = [
    path('recommendations/', RecommendationView.as_view()),
    path('chatbot/', ChatbotView.as_view()),           # MỚI
    path('chatbot/status/', ProductIndexStatusView.as_view()),  # MỚI
    path('behavior/track/', BehaviorTrackView.as_view()),
]
```

### 3E. Cập nhật requirements.txt của recommender-ai-service

```
# Thêm vào file requirements.txt:
sentence-transformers==2.7.0
faiss-cpu==1.8.0
anthropic==0.34.0
numpy>=1.24.0
scikit-learn>=1.3.0
```

### 3F. Cập nhật startup command trong docker-compose.yml

```yaml
recommender-ai-service:
  # ... các config hiện tại giữ nguyên ...
  command: >
    sh -c "python manage.py migrate --run-syncdb &&
           python manage.py sync_product_index &&
           python manage.py build_kb_graph &&
           python manage.py build_faiss_index &&
           python manage.py runserver 0.0.0.0:8000"
```

**Tạo thêm management command: `build_faiss_index`**

```python
# recommender-ai-service/recommender/management/commands/build_faiss_index.py
from django.core.management.base import BaseCommand
from recommender.services.rag_service import RAGService

class Command(BaseCommand):
    help = 'Build FAISS vector index từ ProductIndex table'

    def handle(self, *args, **options):
        self.stdout.write('Building FAISS index...')
        rag = RAGService.get_instance()
        rag.build_index()
        self.stdout.write(self.style.SUCCESS('FAISS index đã build xong!'))
```

### 3G. Cập nhật api-gateway — thêm route chatbot

**File: `api-gateway/gateway/views.py`** — thêm:

```python
"/api/chatbot/": "RECOMMENDER_SERVICE_URL",
"/api/behavior/": "RECOMMENDER_SERVICE_URL",
```

---

## TASK 4 — Chatbot Widget trong Frontend React

**File: `frontend/src/components/ChatbotWidget.tsx`**

```tsx
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  products?: Product[];
}

interface Product {
  product_id: number;
  name: string;
  price: number;
  product_type: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Xin chào! Tôi là trợ lý mua sắm của ShopMicro 🛍️\nBạn cần tư vấn sách, laptop hay quần áo gì không?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const customerId = localStorage.getItem("customer_id");

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chatbot/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, customer_id: customerId }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          products: data.products || [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "đ";

  const typeEmoji = (type: string) =>
    ({ book: "📚", laptop: "💻", fashion: "👕" })[type] || "🛍️";

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 
                   hover:bg-blue-700 text-white rounded-full shadow-lg 
                   flex items-center justify-center text-2xl transition-all"
        title="Tư vấn mua sắm AI"
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 
                        bg-white rounded-2xl shadow-2xl flex flex-col 
                        overflow-hidden"
          style={{ height: "520px" }}
        >
          {/* Header */}
          <div className="bg-blue-600 text-white px-4 py-3 flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <div>
              <div className="font-semibold text-sm">Trợ lý ShopMicro</div>
              <div className="text-xs text-blue-200">
                Tư vấn sách • Laptop • Thời trang
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 shadow-sm rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {/* Product cards */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.products.slice(0, 3).map((p) => (
                        <a
                          key={p.product_id}
                          href={`/products/${p.product_id}`}
                          className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 
                                     rounded-lg p-2 text-xs text-blue-800 transition-colors"
                        >
                          <span>{typeEmoji(p.product_type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{p.name}</div>
                            <div className="text-blue-600">
                              {formatPrice(p.price)}
                            </div>
                          </div>
                          <span>→</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-2 h-2 bg-blue-400 rounded-full 
                                               animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          <div className="px-3 py-2 bg-white border-t flex gap-1 overflow-x-auto">
            {[
              "Laptop gaming dưới 20tr",
              "Sách khoa học hay",
              "Đồ đi biển nữ",
            ].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setInput(s);
                }}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 
                           rounded-full px-3 py-1 whitespace-nowrap transition-colors"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-3 pb-3 bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Bạn cần tư vấn gì?"
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 
                         focus:outline-none focus:ring-2 focus:ring-blue-300"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 
                         text-white rounded-xl px-3 py-2 text-sm transition-colors"
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
```

**Tích hợp vào `frontend/src/App.tsx`:**

```tsx
import ChatbotWidget from "./components/ChatbotWidget";

// Trong return(), thêm ở ngoài cùng (ngang với Router):
<>
  <Router>{/* ... existing routes ... */}</Router>
  <ChatbotWidget />
</>;
```

---

## THỨ TỰ THỰC HIỆN

```
Bước 1: TASK 2 — Fix PostgreSQL settings.py (15 phút, không tốn công nhiều)
         docker-compose down && docker-compose up --build -d
         Verify: docker-compose exec book-service python manage.py dbshell

Bước 2: TASK 1A — Cập nhật catalog model + migrate + seed catalogs mới
         docker-compose exec catalog-service python manage.py makemigrations
         docker-compose exec catalog-service python manage.py migrate
         docker-compose exec catalog-service python manage.py seed_catalogs

Bước 3: TASK 1B — Cập nhật book-service models (thêm Laptop, Fashion)
         docker-compose exec book-service python manage.py makemigrations
         docker-compose exec book-service python manage.py migrate

Bước 4: TASK 1C — Seed 100+ sản phẩm
         docker-compose exec book-service python manage.py seed_products

Bước 5: TASK 3A+3B — Thêm ProductIndex model + sync command
         docker-compose exec recommender-ai-service python manage.py migrate
         docker-compose exec recommender-ai-service python manage.py sync_product_index

Bước 6: TASK 3C+3D — RAG service + chatbot endpoint
         docker-compose up --build recommender-ai-service

Bước 7: TASK 3F — Cập nhật compose command + build FAISS
         docker-compose up -d recommender-ai-service

Bước 8: TASK 4 — Chatbot widget frontend
         cd frontend && yarn dev (test local)
```

---

## LỆNH TEST SAU KHI HOÀN THÀNH

```bash
# 1. Test chatbot laptop
curl -X POST http://localhost:8000/api/chatbot/ \
  -H "Content-Type: application/json" \
  -d '{"message": "tôi muốn mua laptop ASUS gaming dưới 20 triệu", "customer_id": 1}'

# 2. Test chatbot sách
curl -X POST http://localhost:8000/api/chatbot/ \
  -H "Content-Type: application/json" \
  -d '{"message": "tôi muốn tìm sách về khoa học vũ trụ", "customer_id": 1}'

# 3. Test chatbot quần áo đi biển
curl -X POST http://localhost:8000/api/chatbot/ \
  -H "Content-Type: application/json" \
  -d '{"message": "quần áo đi biển cho nữ mùa hè", "customer_id": 2}'

# 4. Test filter sản phẩm theo loại
curl "http://localhost:8000/api/products/?product_type=laptop"
curl "http://localhost:8000/api/products/?product_type=fashion"

# 5. Kiểm tra trạng thái RAG index
curl http://localhost:8000/api/chatbot/status/
# Expected: {"product_index_count": 100+, "faiss_index_exists": true, ...}
```

---

_Prompt này dựa trực tiếp trên code thực trong repo RaynNg/E-commerce-Microservice-Application._
_Stack: Django DRF + PostgreSQL + Neo4j + RabbitMQ + React/Vite + Anthropic Claude._
