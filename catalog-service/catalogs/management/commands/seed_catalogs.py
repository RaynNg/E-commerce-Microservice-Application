from django.core.management.base import BaseCommand
from catalogs.models import Catalog


BOOK_CATEGORIES = [
    {"name": "Lập trình & Công nghệ", "description": "Sách về Python, Java, Web, AI...", "icon": "💻"},
    {"name": "Khoa học & Tự nhiên", "description": "Vật lý, Hóa học, Sinh học...", "icon": "🔬"},
    {"name": "Kinh tế & Kinh doanh", "description": "Quản trị, Marketing, Tài chính...", "icon": "💼"},
    {"name": "Văn học trong nước", "description": "Tiểu thuyết, truyện ngắn Việt Nam", "icon": "🇻🇳"},
    {"name": "Văn học nước ngoài", "description": "Dịch phẩm nổi tiếng thế giới", "icon": "🌍"},
    {"name": "Kỹ năng sống", "description": "Phát triển bản thân, tư duy tích cực", "icon": "🌱"},
    {"name": "Lịch sử & Địa lý", "description": "Lịch sử Việt Nam và thế giới", "icon": "🗺️"},
]

LAPTOP_CATEGORIES = [
    {"name": "Laptop Gaming", "description": "RTX series, hiệu năng cao cho game", "icon": "🎮"},
    {"name": "Laptop Văn phòng", "description": "Mỏng nhẹ, pin trâu, office work", "icon": "💼"},
    {"name": "Laptop Đồ họa", "description": "Màn hình màu chuẩn, GPU mạnh", "icon": "🎨"},
    {"name": "Laptop Sinh viên", "description": "Giá tốt, đủ dùng cho học tập", "icon": "🎓"},
    {"name": "MacBook", "description": "Apple MacBook Air và MacBook Pro", "icon": "🍎"},
    {"name": "Phụ kiện Laptop", "description": "Chuột, bàn phím, túi, đế tản nhiệt", "icon": "🖱️"},
]

FASHION_CATEGORIES = [
    {"name": "Áo nam", "description": "Áo thun, áo sơ mi, áo polo nam", "icon": "👔"},
    {"name": "Quần nam", "description": "Quần jean, kaki, short nam", "icon": "👖"},
    {"name": "Áo nữ", "description": "Áo thun, áo sơ mi, blouse nữ", "icon": "👗"},
    {"name": "Quần & Váy nữ", "description": "Quần jean, váy đầm, chân váy", "icon": "👗"},
    {"name": "Đồ đi biển", "description": "Áo bơi, short bơi, đồ resort", "icon": "🏖️"},
    {"name": "Giày dép", "description": "Sneaker, sandal, giày da", "icon": "👟"},
    {"name": "Phụ kiện thời trang", "description": "Túi xách, thắt lưng, mũ nón", "icon": "👜"},
]


class Command(BaseCommand):
    help = 'Seed catalog data for all product types (book, laptop, fashion)'

    def handle(self, *args, **options):
        created_count = 0

        for product_type, categories in [
            ('book', BOOK_CATEGORIES),
            ('laptop', LAPTOP_CATEGORIES),
            ('fashion', FASHION_CATEGORIES),
        ]:
            for cat_data in categories:
                catalog, created = Catalog.objects.get_or_create(
                    name=cat_data["name"],
                    defaults={
                        "description": cat_data["description"],
                        "icon": cat_data["icon"],
                        "product_type": product_type,
                        "is_active": True,
                    }
                )
                if created:
                    created_count += 1
                    self.stdout.write(f"Created [{product_type}] catalog: {catalog.name}")
                else:
                    changed = False
                    for field in ("description", "icon"):
                        if getattr(catalog, field) != cat_data[field]:
                            setattr(catalog, field, cat_data[field])
                            changed = True
                    if catalog.product_type != product_type:
                        catalog.product_type = product_type
                        changed = True
                    if changed:
                        catalog.save()
                    self.stdout.write(f"Catalog already exists: {catalog.name}")

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded {created_count} new catalogs. "
                f"Total: {Catalog.objects.count()}"
            )
        )
