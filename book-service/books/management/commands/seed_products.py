"""
Seed 100+ sản phẩm cho 3 loại hàng: sách, laptop, quần áo.
Chạy: docker-compose exec book-service python manage.py seed_products
"""
import os
import requests
from django.core.management.base import BaseCommand
from books.models import Product, Book, Laptop, Fashion

CATALOG_SERVICE_URL = os.environ.get('CATALOG_SERVICE_URL', 'http://catalog-service:8000')

# catalog_id mapping (theo thứ tự seed_catalogs)
# Book: Lập trình(1), Khoa học(2), Kinh tế(3), Văn học VN(4), Văn học NN(5), Kỹ năng(6), Lịch sử(7)
# Laptop: Gaming(8), Văn phòng(9), Đồ họa(10), Sinh viên(11), MacBook(12), Phụ kiện(13)
# Fashion: Áo nam(14), Quần nam(15), Áo nữ(16), Quần & Váy nữ(17), Đi biển(18), Giày dép(19), Phụ kiện(20)

BOOKS_DATA = [
    # Lập trình & Công nghệ — catalog_id=1
    {"catalog_name": "Lập trình & Công nghệ",
     "name": "Python Crash Course (3rd Edition)", "price": 280000, "stock": 50,
     "image_url": "https://covers.openlibrary.org/b/isbn/9781718502703-M.jpg",
     "description": "Sách học Python từ cơ bản đến nâng cao, có bài tập thực hành.",
     "book": {"author": "Eric Matthes", "publisher": "No Starch Press",
              "isbn": "9781718502703", "pages": 552, "language": "Tiếng Anh", "published_year": 2023}},
    {"catalog_name": "Lập trình & Công nghệ",
     "name": "Clean Code - Mã sạch", "price": 199000, "stock": 30,
     "description": "Hướng dẫn viết code sạch, dễ bảo trì theo tiêu chuẩn chuyên nghiệp.",
     "book": {"author": "Robert C. Martin", "publisher": "NXB Lao Động",
              "isbn": "9786045659501", "pages": 431, "language": "Tiếng Việt", "published_year": 2021}},
    {"catalog_name": "Lập trình & Công nghệ",
     "name": "Học Machine Learning với Python", "price": 249000, "stock": 40,
     "description": "Từ hồi quy tuyến tính đến deep learning, có code thực hành.",
     "book": {"author": "Aurélien Géron", "publisher": "NXB Khoa học Kỹ thuật",
              "pages": 740, "language": "Tiếng Việt"}},
    {"catalog_name": "Lập trình & Công nghệ",
     "name": "JavaScript: The Good Parts", "price": 185000, "stock": 25,
     "description": "Phần tinh hoa của ngôn ngữ JavaScript, dành cho developer muốn code tốt hơn.",
     "book": {"author": "Douglas Crockford", "publisher": "O'Reilly",
              "pages": 176, "language": "Tiếng Anh"}},
    {"catalog_name": "Lập trình & Công nghệ",
     "name": "Thiết kế hệ thống phần mềm", "price": 320000, "stock": 35,
     "description": "System design cho software engineers, từ basic đến distributed systems.",
     "book": {"author": "Alex Xu", "publisher": "NXB Trẻ",
              "pages": 400, "language": "Tiếng Việt"}},
    {"catalog_name": "Lập trình & Công nghệ",
     "name": "Docker & Kubernetes thực chiến", "price": 265000, "stock": 20,
     "description": "Containerization và orchestration cho ứng dụng production.",
     "book": {"author": "Nigel Poulton", "publisher": "NXB Khoa học Kỹ thuật",
              "pages": 320, "language": "Tiếng Việt", "published_year": 2022}},
    # Khoa học & Tự nhiên — catalog_id=2
    {"catalog_name": "Khoa học & Tự nhiên",
     "name": "Lược sử thời gian", "price": 135000, "stock": 60,
     "description": "Từ Big Bang đến lỗ đen, vũ trụ học giải thích dễ hiểu.",
     "book": {"author": "Stephen Hawking", "publisher": "NXB Trẻ",
              "pages": 232, "language": "Tiếng Việt"}},
    {"catalog_name": "Khoa học & Tự nhiên",
     "name": "Sapiens: Lược sử loài người", "price": 168000, "stock": 80,
     "description": "Lịch sử 70.000 năm của loài người qua góc nhìn khoa học.",
     "book": {"author": "Yuval Noah Harari", "publisher": "NXB Tri Thức",
              "pages": 559, "language": "Tiếng Việt"}},
    {"catalog_name": "Khoa học & Tự nhiên",
     "name": "Vũ trụ trong vỏ hạt dẻ", "price": 145000, "stock": 45,
     "description": "Stephen Hawking giải thích vật lý lý thuyết bằng hình ảnh trực quan.",
     "book": {"author": "Stephen Hawking", "publisher": "NXB Trẻ",
              "pages": 224, "language": "Tiếng Việt"}},
    {"catalog_name": "Khoa học & Tự nhiên",
     "name": "Homo Deus: Lược sử tương lai", "price": 155000, "stock": 50,
     "description": "Tương lai của nhân loại trong thời đại AI và công nghệ sinh học.",
     "book": {"author": "Yuval Noah Harari", "publisher": "NXB Tri Thức",
              "pages": 528, "language": "Tiếng Việt"}},
    # Kinh tế & Kinh doanh — catalog_id=3
    {"catalog_name": "Kinh tế & Kinh doanh",
     "name": "Đắc nhân tâm", "price": 90000, "stock": 100,
     "description": "Nghệ thuật giao tiếp và tạo dựng mối quan hệ, bestseller mọi thời đại.",
     "book": {"author": "Dale Carnegie", "publisher": "NXB Tổng hợp TP.HCM",
              "pages": 320, "language": "Tiếng Việt"}},
    {"catalog_name": "Kinh tế & Kinh doanh",
     "name": "Zero to One", "price": 125000, "stock": 45,
     "description": "Peter Thiel chia sẻ về xây dựng startup từ con số không.",
     "book": {"author": "Peter Thiel", "publisher": "NXB Trẻ",
              "pages": 256, "language": "Tiếng Việt"}},
    {"catalog_name": "Kinh tế & Kinh doanh",
     "name": "Khởi nghiệp tinh gọn", "price": 112000, "stock": 60,
     "description": "Phương pháp Lean Startup - xây dựng sản phẩm nhanh và hiệu quả.",
     "book": {"author": "Eric Ries", "publisher": "NXB Lao Động Xã Hội",
              "pages": 336, "language": "Tiếng Việt"}},
    {"catalog_name": "Kinh tế & Kinh doanh",
     "name": "Tư duy nhanh và chậm", "price": 148000, "stock": 55,
     "description": "Daniel Kahneman khám phá hai hệ thống tư duy của con người.",
     "book": {"author": "Daniel Kahneman", "publisher": "NXB Thế Giới",
              "pages": 544, "language": "Tiếng Việt"}},
    # Văn học trong nước — catalog_id=4
    {"catalog_name": "Văn học trong nước",
     "name": "Số đỏ", "price": 75000, "stock": 70,
     "description": "Tiểu thuyết trào phúng kinh điển của văn học Việt Nam.",
     "book": {"author": "Vũ Trọng Phụng", "publisher": "NXB Văn học",
              "pages": 264, "language": "Tiếng Việt", "published_year": 1936}},
    {"catalog_name": "Văn học trong nước",
     "name": "Tắt đèn", "price": 68000, "stock": 55,
     "description": "Cuộc sống bần cùng của nông dân Việt Nam trước Cách mạng tháng Tám.",
     "book": {"author": "Ngô Tất Tố", "publisher": "NXB Văn học",
              "pages": 192, "language": "Tiếng Việt"}},
    {"catalog_name": "Văn học trong nước",
     "name": "Mắt biếc", "price": 85000, "stock": 80,
     "description": "Câu chuyện tình đẹp buồn của Nguyễn Nhật Ánh.",
     "book": {"author": "Nguyễn Nhật Ánh", "publisher": "NXB Trẻ",
              "pages": 272, "language": "Tiếng Việt", "published_year": 1990}},
    # Văn học nước ngoài — catalog_id=5
    {"catalog_name": "Văn học nước ngoài",
     "name": "Nhà giả kim", "price": 88000, "stock": 90,
     "description": "Hành trình theo đuổi ước mơ của Santiago - cậu bé chăn cừu người Tây Ban Nha.",
     "book": {"author": "Paulo Coelho", "publisher": "NXB Hội Nhà Văn",
              "pages": 228, "language": "Tiếng Việt"}},
    {"catalog_name": "Văn học nước ngoài",
     "name": "1984", "price": 105000, "stock": 65,
     "description": "Dystopia kinh điển của George Orwell - xã hội toàn trị và sự kiểm soát tư tưởng.",
     "book": {"author": "George Orwell", "publisher": "NXB Hội Nhà Văn",
              "pages": 328, "language": "Tiếng Việt", "published_year": 1949}},
    {"catalog_name": "Văn học nước ngoài",
     "name": "Hoàng tử bé", "price": 62000, "stock": 120,
     "description": "Truyện ngắn kinh điển về tuổi thơ và sự trong sáng của Antoine de Saint-Exupéry.",
     "book": {"author": "Antoine de Saint-Exupéry", "publisher": "NXB Kim Đồng",
              "pages": 96, "language": "Tiếng Việt"}},
    # Kỹ năng sống — catalog_id=6
    {"catalog_name": "Kỹ năng sống",
     "name": "7 thói quen hiệu quả", "price": 118000, "stock": 85,
     "description": "Stephen Covey chia sẻ 7 thói quen của người thành công.",
     "book": {"author": "Stephen R. Covey", "publisher": "NXB Tổng hợp TP.HCM",
              "pages": 432, "language": "Tiếng Việt"}},
    {"catalog_name": "Kỹ năng sống",
     "name": "Người bán hàng vĩ đại nhất thế giới", "price": 95000, "stock": 70,
     "description": "Og Mandino - nghệ thuật bán hàng và thái độ sống tích cực.",
     "book": {"author": "Og Mandino", "publisher": "NXB Lao Động Xã Hội",
              "pages": 192, "language": "Tiếng Việt"}},
    # Lịch sử & Địa lý — catalog_id=7
    {"catalog_name": "Lịch sử & Địa lý",
     "name": "Việt Nam sử lược", "price": 128000, "stock": 40,
     "description": "Tóm tắt lịch sử Việt Nam từ thời dựng nước đến hiện đại.",
     "book": {"author": "Trần Trọng Kim", "publisher": "NXB Văn học",
              "pages": 448, "language": "Tiếng Việt"}},
    {"catalog_name": "Lịch sử & Địa lý",
     "name": "Địa lý du lịch Việt Nam", "price": 145000, "stock": 30,
     "description": "Khám phá địa lý, văn hóa và điểm du lịch 63 tỉnh thành Việt Nam.",
     "book": {"author": "Nhiều tác giả", "publisher": "NXB Giáo dục",
              "pages": 512, "language": "Tiếng Việt"}},
]

LAPTOPS_DATA = [
    # Laptop Gaming — catalog_name="Laptop Gaming"
    {"catalog_name": "Laptop Gaming",
     "name": "ASUS ROG Strix G16 2024", "price": 35990000, "stock": 15,
     "description": "Laptop gaming hiệu năng cao với RTX 4070, màn hình QHD+ 240Hz.",
     "laptop": {"brand": "ASUS", "cpu": "Intel Core i9-14900HX", "ram": "16GB DDR5",
                "storage": "1TB SSD NVMe", "display": "16\" QHD+ 240Hz",
                "gpu": "RTX 4070 8GB", "battery": "90Wh", "weight": 2.5,
                "os": "Windows 11 Home", "warranty_months": 24}},
    {"catalog_name": "Laptop Gaming",
     "name": "ASUS ROG Zephyrus G14 2024", "price": 42990000, "stock": 10,
     "description": "Laptop gaming mỏng nhẹ cao cấp với OLED 2.8K, Ryzen 9.",
     "laptop": {"brand": "ASUS", "cpu": "AMD Ryzen 9 8945HS", "ram": "32GB LPDDR5X",
                "storage": "1TB SSD", "display": "14\" 2.8K 120Hz OLED",
                "gpu": "RTX 4070 8GB", "battery": "73Wh", "weight": 1.65,
                "os": "Windows 11 Home", "warranty_months": 24}},
    {"catalog_name": "Laptop Gaming",
     "name": "Acer Nitro 5 AN515 2024", "price": 18990000, "stock": 25,
     "description": "Laptop gaming giá tốt, RTX 4050 phù hợp cho game FHD.",
     "laptop": {"brand": "Acer", "cpu": "Intel Core i5-13500H", "ram": "16GB DDR5",
                "storage": "512GB SSD", "display": "15.6\" FHD 144Hz",
                "gpu": "RTX 4050 6GB", "battery": "57.5Wh", "weight": 2.2,
                "warranty_months": 12}},
    {"catalog_name": "Laptop Gaming",
     "name": "Dell Gaming G15 5530", "price": 24990000, "stock": 18,
     "description": "Laptop gaming Dell với RTX 4060 và màn hình 165Hz mượt mà.",
     "laptop": {"brand": "Dell", "cpu": "Intel Core i7-13650HX", "ram": "16GB DDR5",
                "storage": "512GB SSD", "display": "15.6\" FHD 165Hz",
                "gpu": "RTX 4060 8GB", "battery": "86Wh", "weight": 2.4,
                "warranty_months": 12}},
    {"catalog_name": "Laptop Gaming",
     "name": "Lenovo LOQ 15IAX9", "price": 19990000, "stock": 20,
     "description": "Laptop gaming Lenovo giá hợp lý cho học sinh sinh viên.",
     "laptop": {"brand": "Lenovo", "cpu": "Intel Core i5-12450HX", "ram": "16GB DDR5",
                "storage": "512GB SSD", "display": "15.6\" FHD 144Hz",
                "gpu": "RTX 4050 6GB", "battery": "60Wh", "weight": 2.4,
                "warranty_months": 12}},
    {"catalog_name": "Laptop Gaming",
     "name": "MSI Katana 15 B13VGK", "price": 26990000, "stock": 12,
     "description": "MSI gaming laptop với RTX 4070, thiết kế đẹp mắt.",
     "laptop": {"brand": "MSI", "cpu": "Intel Core i7-13620H", "ram": "16GB DDR5",
                "storage": "1TB SSD", "display": "15.6\" FHD 144Hz",
                "gpu": "RTX 4070 8GB", "battery": "53.5Wh", "weight": 2.2,
                "warranty_months": 12}},
    # Laptop Văn phòng — catalog_name="Laptop Văn phòng"
    {"catalog_name": "Laptop Văn phòng",
     "name": "Dell XPS 13 Plus 9320", "price": 32990000, "stock": 12,
     "description": "Laptop văn phòng cao cấp mỏng nhẹ, màn hình OLED cảm ứng.",
     "laptop": {"brand": "Dell", "cpu": "Intel Core i7-1260P", "ram": "16GB LPDDR5",
                "storage": "512GB SSD", "display": "13.4\" FHD+ OLED Touch",
                "battery": "55Wh", "weight": 1.26, "warranty_months": 12}},
    {"catalog_name": "Laptop Văn phòng",
     "name": "HP EliteBook 840 G10", "price": 28990000, "stock": 15,
     "description": "Laptop doanh nghiệp bảo mật cao, pin 17 giờ.",
     "laptop": {"brand": "HP", "cpu": "Intel Core i7-1355U", "ram": "16GB DDR5",
                "storage": "512GB SSD", "display": "14\" FHD IPS",
                "battery": "51Wh", "weight": 1.35, "warranty_months": 36}},
    {"catalog_name": "Laptop Văn phòng",
     "name": "Lenovo ThinkPad X1 Carbon Gen 11", "price": 38990000, "stock": 8,
     "description": "ThinkPad cao cấp nhất, siêu mỏng 1.12kg, màn hình 2K IPS.",
     "laptop": {"brand": "Lenovo", "cpu": "Intel Core i7-1365U", "ram": "16GB LPDDR5",
                "storage": "512GB SSD", "display": "14\" 2K IPS",
                "battery": "57Wh", "weight": 1.12, "warranty_months": 36}},
    # MacBook — catalog_name="MacBook"
    {"catalog_name": "MacBook",
     "name": "MacBook Air M3 13\"", "price": 28990000, "stock": 20,
     "description": "MacBook Air nhẹ nhất của Apple với chip M3, pin 18 giờ.",
     "laptop": {"brand": "Apple", "cpu": "Apple M3 8-core", "ram": "8GB Unified",
                "storage": "256GB SSD", "display": "13.6\" Liquid Retina",
                "gpu": "10-core GPU", "battery": "52.6Wh", "weight": 1.24,
                "os": "macOS Sonoma", "warranty_months": 12}},
    {"catalog_name": "MacBook",
     "name": "MacBook Air M3 15\"", "price": 34990000, "stock": 15,
     "description": "MacBook Air 15 inch màn hình lớn hơn, vẫn nhẹ và pin trâu.",
     "laptop": {"brand": "Apple", "cpu": "Apple M3 8-core", "ram": "8GB Unified",
                "storage": "256GB SSD", "display": "15.3\" Liquid Retina",
                "gpu": "10-core GPU", "battery": "66.5Wh", "weight": 1.51,
                "os": "macOS Sonoma", "warranty_months": 12}},
    {"catalog_name": "MacBook",
     "name": "MacBook Pro M3 Pro 14\"", "price": 52990000, "stock": 8,
     "description": "MacBook Pro cho lập trình viên và designer chuyên nghiệp.",
     "laptop": {"brand": "Apple", "cpu": "Apple M3 Pro 11-core", "ram": "18GB Unified",
                "storage": "512GB SSD", "display": "14.2\" Liquid Retina XDR",
                "gpu": "14-core GPU", "battery": "72Wh", "weight": 1.61,
                "os": "macOS Sonoma", "warranty_months": 12}},
    {"catalog_name": "MacBook",
     "name": "MacBook Pro M3 Max 16\"", "price": 89990000, "stock": 5,
     "description": "MacBook Pro mạnh nhất, chip M3 Max cho video editing và ML.",
     "laptop": {"brand": "Apple", "cpu": "Apple M3 Max 14-core", "ram": "36GB Unified",
                "storage": "1TB SSD", "display": "16.2\" Liquid Retina XDR",
                "gpu": "40-core GPU", "battery": "100Wh", "weight": 2.15,
                "os": "macOS Sonoma", "warranty_months": 12}},
    # Laptop Sinh viên — catalog_name="Laptop Sinh viên"
    {"catalog_name": "Laptop Sinh viên",
     "name": "Acer Aspire 3 A315-58", "price": 10990000, "stock": 35,
     "description": "Laptop sinh viên giá rẻ, đủ dùng cho học tập văn phòng.",
     "laptop": {"brand": "Acer", "cpu": "Intel Core i3-1115G4", "ram": "8GB DDR4",
                "storage": "256GB SSD", "display": "15.6\" FHD IPS",
                "battery": "41.4Wh", "weight": 1.7, "warranty_months": 12}},
    {"catalog_name": "Laptop Sinh viên",
     "name": "ASUS Vivobook 15 X1502ZA", "price": 14990000, "stock": 28,
     "description": "ASUS Vivobook thiết kế đẹp, giá tốt cho sinh viên.",
     "laptop": {"brand": "ASUS", "cpu": "Intel Core i5-12500H", "ram": "16GB DDR4",
                "storage": "512GB SSD", "display": "15.6\" FHD IPS",
                "battery": "42Wh", "weight": 1.7, "warranty_months": 12}},
    {"catalog_name": "Laptop Sinh viên",
     "name": "Lenovo IdeaPad 3 15IAU7", "price": 11990000, "stock": 30,
     "description": "IdeaPad 3 với bàn phím thoải mái, phù hợp học tập hàng ngày.",
     "laptop": {"brand": "Lenovo", "cpu": "Intel Core i5-1235U", "ram": "8GB DDR4",
                "storage": "256GB SSD", "display": "15.6\" FHD IPS",
                "battery": "38Wh", "weight": 1.65, "warranty_months": 12}},
    # Laptop Đồ họa — catalog_name="Laptop Đồ họa"
    {"catalog_name": "Laptop Đồ họa",
     "name": "ASUS ProArt Studiobook 16 OLED", "price": 45990000, "stock": 6,
     "description": "Laptop đồ họa cao cấp với màn hình OLED 4K, màu sắc chuẩn DCI-P3 100%.",
     "laptop": {"brand": "ASUS", "cpu": "AMD Ryzen 9 7945HX", "ram": "32GB DDR5",
                "storage": "1TB SSD", "display": "16\" OLED 4K 60Hz",
                "gpu": "RTX 4070 8GB", "weight": 2.4, "warranty_months": 24}},
]

FASHION_DATA = [
    # Áo nam — catalog_name="Áo nam"
    {"catalog_name": "Áo nam",
     "name": "Áo thun nam basic cotton trắng", "price": 149000, "stock": 100,
     "description": "Áo thun nam form regular, cotton 100% thoáng mát.",
     "fashion": {"brand": "Local Brand VN", "sizes": ["S", "M", "L", "XL", "XXL"],
                 "colors": ["Trắng", "Đen", "Xám"], "material": "100% Cotton", "gender": "male"}},
    {"catalog_name": "Áo nam",
     "name": "Áo polo nam Lacoste slim fit", "price": 890000, "stock": 30,
     "description": "Áo polo nam Lacoste chính hãng, chất vải piqué cao cấp.",
     "fashion": {"brand": "Lacoste", "sizes": ["M", "L", "XL"],
                 "colors": ["Xanh navy", "Trắng", "Đỏ"], "material": "Piqué cotton", "gender": "male"}},
    {"catalog_name": "Áo nam",
     "name": "Áo sơ mi nam Oxford trắng", "price": 350000, "stock": 50,
     "description": "Áo sơ mi nam form regular, vải Oxford chống nhăn.",
     "fashion": {"brand": "Owen", "sizes": ["S", "M", "L", "XL"],
                 "colors": ["Trắng", "Xanh nhạt"], "material": "Cotton Oxford", "gender": "male"}},
    {"catalog_name": "Áo nam",
     "name": "Áo thun in logo Adidas", "price": 450000, "stock": 60,
     "description": "Áo thun Adidas Original, chất cotton pha spandex co giãn.",
     "fashion": {"brand": "Adidas", "sizes": ["S", "M", "L", "XL", "XXL"],
                 "colors": ["Đen", "Trắng", "Xanh navy"], "material": "Cotton pha Spandex", "gender": "male"}},
    # Quần nam — catalog_name="Quần nam"
    {"catalog_name": "Quần nam",
     "name": "Quần jean nam slim fit xanh đậm", "price": 399000, "stock": 70,
     "description": "Quần jean nam form slim, vải denim co giãn thoải mái.",
     "fashion": {"brand": "Routine", "sizes": ["28", "29", "30", "31", "32", "34"],
                 "colors": ["Xanh đậm", "Xanh nhạt", "Đen"], "material": "Denim co giãn", "gender": "male"}},
    {"catalog_name": "Quần nam",
     "name": "Quần kaki nam công sở", "price": 299000, "stock": 55,
     "description": "Quần kaki nam màu trơn, phù hợp đi làm và dạo phố.",
     "fashion": {"brand": "An Phước", "sizes": ["28", "29", "30", "31", "32"],
                 "colors": ["Be", "Xám", "Đen", "Nâu"], "material": "Cotton kaki", "gender": "male"}},
    {"catalog_name": "Quần nam",
     "name": "Quần short nam thể thao Nike", "price": 650000, "stock": 80,
     "description": "Quần short Nike Dri-FIT, thoát mồ hôi nhanh cho thể thao.",
     "fashion": {"brand": "Nike", "sizes": ["S", "M", "L", "XL"],
                 "colors": ["Đen", "Xám", "Xanh navy"], "material": "Polyester Dri-FIT",
                 "gender": "male", "season": "Hè"}},
    # Áo nữ — catalog_name="Áo nữ"
    {"catalog_name": "Áo nữ",
     "name": "Áo blouse nữ cổ V trắng", "price": 289000, "stock": 65,
     "description": "Áo blouse nữ vải chiffon nhẹ, phù hợp đi làm và dạo phố.",
     "fashion": {"brand": "ZARA", "sizes": ["XS", "S", "M", "L"],
                 "colors": ["Trắng", "Đen", "Hồng pastel"], "material": "Chiffon", "gender": "female"}},
    {"catalog_name": "Áo nữ",
     "name": "Áo thun nữ basic crop top", "price": 165000, "stock": 90,
     "description": "Áo thun nữ form crop, cotton thoáng mát cho mùa hè.",
     "fashion": {"brand": "H&M", "sizes": ["XS", "S", "M", "L", "XL"],
                 "colors": ["Trắng", "Đen", "Hồng", "Xanh mint"],
                 "material": "Cotton 100%", "gender": "female", "season": "Hè"}},
    {"catalog_name": "Áo nữ",
     "name": "Áo sơ mi nữ kẻ sọc nhỏ", "price": 320000, "stock": 45,
     "description": "Áo sơ mi nữ kẻ sọc tinh tế, vải cotton mềm mịn.",
     "fashion": {"brand": "Owen", "sizes": ["XS", "S", "M", "L"],
                 "colors": ["Trắng sọc xanh", "Trắng sọc đen"], "material": "Cotton", "gender": "female"}},
    # Quần & Váy nữ — catalog_name="Quần & Váy nữ"
    {"catalog_name": "Quần & Váy nữ",
     "name": "Váy midi hoa nhí nữ", "price": 399000, "stock": 50,
     "description": "Váy midi hoa nhí tầng tầng, phong cách boho tiểu thư.",
     "fashion": {"brand": "ZARA", "sizes": ["XS", "S", "M", "L"],
                 "colors": ["Trắng hoa", "Hồng hoa", "Xanh hoa"],
                 "material": "Viscose", "gender": "female", "season": "Hè"}},
    {"catalog_name": "Quần & Váy nữ",
     "name": "Quần jean nữ ống suông", "price": 450000, "stock": 60,
     "description": "Quần jean nữ form ống suông, denim cao cấp tôn dáng.",
     "fashion": {"brand": "Levi's", "sizes": ["25", "26", "27", "28", "29"],
                 "colors": ["Xanh trơn", "Xanh wash", "Đen"],
                 "material": "Denim", "gender": "female"}},
    {"catalog_name": "Quần & Váy nữ",
     "name": "Chân váy xếp li kaki", "price": 285000, "stock": 55,
     "description": "Chân váy xếp li midi kaki, thanh lịch phù hợp đi làm.",
     "fashion": {"brand": "IFU", "sizes": ["XS", "S", "M", "L"],
                 "colors": ["Be", "Đen", "Xanh navy"],
                 "material": "Kaki", "gender": "female"}},
    # Đồ đi biển — catalog_name="Đồ đi biển"
    {"catalog_name": "Đồ đi biển",
     "name": "Quần short bơi nam tropical", "price": 199000, "stock": 80,
     "description": "Quần short bơi nam họa tiết nhiệt đới, khô nhanh.",
     "fashion": {"brand": "Speedo", "sizes": ["S", "M", "L", "XL"],
                 "colors": ["Xanh biển", "Cam", "Đen"], "material": "Polyester nhanh khô",
                 "gender": "male", "season": "Hè"}},
    {"catalog_name": "Đồ đi biển",
     "name": "Áo bơi nữ 1 mảnh UPF50+", "price": 350000, "stock": 60,
     "description": "Áo bơi nữ chống nắng UPF50+, vải co giãn 4 chiều.",
     "fashion": {"brand": "Arena", "sizes": ["XS", "S", "M", "L"],
                 "colors": ["Đen", "Xanh navy", "Hồng"], "material": "Nylon Lycra",
                 "gender": "female", "season": "Hè"}},
    {"catalog_name": "Đồ đi biển",
     "name": "Áo sơ mi đi biển unisex linen", "price": 285000, "stock": 70,
     "description": "Áo sơ mi linen thoáng mát, phong cách resort đi biển.",
     "fashion": {"brand": "Routine", "sizes": ["S", "M", "L", "XL", "XXL"],
                 "colors": ["Trắng", "Kem", "Xanh pastel"], "material": "Linen 100%",
                 "gender": "unisex", "season": "Hè"}},
    {"catalog_name": "Đồ đi biển",
     "name": "Set đồ resort nữ (áo + quần)", "price": 520000, "stock": 40,
     "description": "Set đồ resort 2 món, vải viscose nhẹ mịn cho kỳ nghỉ biển.",
     "fashion": {"brand": "YODY", "sizes": ["S", "M", "L"],
                 "colors": ["Trắng hoa", "Be hoa", "Xanh sọc"], "material": "Viscose",
                 "gender": "female", "season": "Hè"}},
    {"catalog_name": "Đồ đi biển",
     "name": "Kính mát unisex UV400", "price": 180000, "stock": 100,
     "description": "Kính mát chống tia UV400, gọng nhựa nhẹ, phù hợp đi biển.",
     "fashion": {"brand": "Ray-Ban VN", "sizes": ["Free size"],
                 "colors": ["Đen", "Nâu tortoise", "Xanh biển"],
                 "material": "Nhựa TR90 + Kính Polycarbonate", "gender": "unisex", "season": "Hè"}},
    # Giày dép — catalog_name="Giày dép"
    {"catalog_name": "Giày dép",
     "name": "Sneaker Nike Air Force 1 trắng", "price": 2490000, "stock": 35,
     "description": "Nike Air Force 1 cổ thấp màu trắng thuần khiết, biểu tượng đường phố.",
     "fashion": {"brand": "Nike", "sizes": ["38", "39", "40", "41", "42", "43", "44"],
                 "colors": ["Trắng"], "material": "Leather tổng hợp",
                 "gender": "unisex"}},
    {"catalog_name": "Giày dép",
     "name": "Sandal nam da bò handmade", "price": 450000, "stock": 40,
     "description": "Sandal nam da bò thật thủ công, bền đẹp theo thời gian.",
     "fashion": {"brand": "Giày Hàn Quốc", "sizes": ["38", "39", "40", "41", "42", "43"],
                 "colors": ["Nâu", "Đen"], "material": "Da bò thật", "gender": "male"}},
    {"catalog_name": "Giày dép",
     "name": "Dép nữ đế bệt hoa cúc", "price": 220000, "stock": 75,
     "description": "Dép nữ đế bệt họa tiết hoa cúc cute, nhẹ nhàng đi hè.",
     "fashion": {"brand": "Bitis", "sizes": ["35", "36", "37", "38", "39"],
                 "colors": ["Trắng", "Be", "Hồng"], "material": "PU cao cấp",
                 "gender": "female", "season": "Hè"}},
    # Phụ kiện thời trang — catalog_name="Phụ kiện thời trang"
    {"catalog_name": "Phụ kiện thời trang",
     "name": "Túi tote canvas in chữ", "price": 185000, "stock": 90,
     "description": "Túi tote vải canvas dày, có túi nhỏ bên trong, nhiều màu.",
     "fashion": {"brand": "Local Brand", "sizes": ["Free size"],
                 "colors": ["Trắng", "Đen", "Kem"], "material": "Canvas 12oz",
                 "gender": "unisex"}},
    {"catalog_name": "Phụ kiện thời trang",
     "name": "Nón bucket hat trơn", "price": 135000, "stock": 120,
     "description": "Nón bucket che nắng thời trang, vải cotton mềm mịn.",
     "fashion": {"brand": "H&M", "sizes": ["Free size"],
                 "colors": ["Đen", "Be", "Xanh navy", "Hồng pastel"],
                 "material": "Cotton 100%", "gender": "unisex", "season": "Hè"}},
]


class Command(BaseCommand):
    help = 'Seed 100+ products (books, laptops, fashion) from sample data'

    def _get_catalog_map(self):
        """Fetch catalog name→id mapping from catalog-service."""
        try:
            resp = requests.get(f"{CATALOG_SERVICE_URL}/api/catalogs/", timeout=10)
            catalogs = resp.json()
            if isinstance(catalogs, dict):
                catalogs = catalogs.get('results', [])
            return {c['name']: c['id'] for c in catalogs}
        except Exception as e:
            self.stderr.write(f"Không thể lấy catalog list: {e}")
            return {}

    def handle(self, *args, **options):
        catalog_map = self._get_catalog_map()
        if not catalog_map:
            self.stdout.write(self.style.WARNING(
                "Không lấy được catalog list. Dùng catalog_id giả (1-20)."
            ))

        created = 0

        for data in BOOKS_DATA:
            catalog_id = catalog_map.get(data['catalog_name'], 1)
            product, _ = Product.objects.update_or_create(
                name=data['name'],
                product_type='book',
                defaults={
                    'catalog_id': catalog_id,
                    'description': data.get('description', ''),
                    'price': data['price'],
                    'stock': data['stock'],
                    'image_url': data.get('image_url', ''),
                    'is_active': True,
                }
            )
            Book.objects.update_or_create(
                product=product,
                defaults=data['book']
            )
            created += 1

        for data in LAPTOPS_DATA:
            catalog_id = catalog_map.get(data['catalog_name'], 8)
            product, _ = Product.objects.update_or_create(
                name=data['name'],
                product_type='laptop',
                defaults={
                    'catalog_id': catalog_id,
                    'description': data.get('description', ''),
                    'price': data['price'],
                    'stock': data['stock'],
                    'image_url': data.get('image_url', ''),
                    'is_active': True,
                }
            )
            Laptop.objects.update_or_create(
                product=product,
                defaults=data['laptop']
            )
            created += 1

        for data in FASHION_DATA:
            catalog_id = catalog_map.get(data['catalog_name'], 14)
            product, _ = Product.objects.update_or_create(
                name=data['name'],
                product_type='fashion',
                defaults={
                    'catalog_id': catalog_id,
                    'description': data.get('description', ''),
                    'price': data['price'],
                    'stock': data['stock'],
                    'image_url': data.get('image_url', ''),
                    'is_active': True,
                }
            )
            Fashion.objects.update_or_create(
                product=product,
                defaults=data['fashion']
            )
            created += 1

        book_count = Product.objects.filter(product_type='book').count()
        laptop_count = Product.objects.filter(product_type='laptop').count()
        fashion_count = Product.objects.filter(product_type='fashion').count()

        self.stdout.write(self.style.SUCCESS(
            f"Seed xong {created} sản phẩm: "
            f"{book_count} sách, {laptop_count} laptop, {fashion_count} quần áo."
        ))
