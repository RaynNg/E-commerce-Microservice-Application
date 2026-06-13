"""
Sync sản phẩm từ product-service vào ProductIndex.
Chạy: python manage.py sync_product_index
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
        product_service_url = os.environ.get('PRODUCT_SERVICE_URL', 'http://product-service:8000')

        if options['rebuild']:
            ProductIndex.objects.all().delete()
            self.stdout.write('Đã xóa index cũ.')

        try:
            resp = requests.get(f"{product_service_url}/api/products/", timeout=30)
            resp.raise_for_status()
            data = resp.json()
            products = data.get('results', data) if isinstance(data, dict) else data
        except Exception as e:
            self.stderr.write(f"Lỗi khi fetch products: {e}")
            return

        created = updated = 0
        for p in products:
            detail = p.get('detail') or {}

            parts = [p.get('name', ''), p.get('description', '')]
            ptype = p.get('product_type', 'book')

            if ptype == 'book':
                parts += [
                    detail.get('author', ''),
                    detail.get('publisher', ''),
                    f"ISBN {detail.get('isbn', '')}",
                    detail.get('language', ''),
                ]
            elif ptype == 'laptop':
                parts += [
                    detail.get('brand', ''),
                    detail.get('cpu', ''),
                    detail.get('ram', ''),
                    detail.get('gpu', ''),
                    f"màn hình {detail.get('display', '')}",
                    f"bảo hành {detail.get('warranty_months', 12)} tháng",
                    detail.get('os', ''),
                ]
            elif ptype == 'fashion':
                sizes = ', '.join(detail.get('sizes') or [])
                colors = ', '.join(detail.get('colors') or [])
                gender_map = {'male': 'nam', 'female': 'nữ', 'unisex': 'unisex'}
                parts += [
                    detail.get('brand', ''),
                    detail.get('material', ''),
                    f"size: {sizes}",
                    f"màu: {colors}",
                    detail.get('season', ''),
                    gender_map.get(detail.get('gender', ''), ''),
                ]

            search_text = ' | '.join(x for x in parts if x)

            _, created_flag = ProductIndex.objects.update_or_create(
                product_id=p['id'],
                defaults={
                    'product_type': ptype,
                    'name': p.get('name', ''),
                    'description': p.get('description', ''),
                    'price': p.get('price', 0),
                    'catalog_id': p.get('catalog_id', 0),
                    'search_text': search_text,
                    'raw_data': p,
                }
            )
            if created_flag:
                created += 1
            else:
                updated += 1

        self.stdout.write(self.style.SUCCESS(
            f'Sync xong: {created} mới, {updated} cập nhật. '
            f'Tổng {ProductIndex.objects.count()} sản phẩm.'
        ))
