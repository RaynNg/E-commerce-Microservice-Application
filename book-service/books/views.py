import os
from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Product, Book, Laptop, Fashion
from .serializers import ProductSerializer, BookCompatSerializer

STAFF_SERVICE_URL = os.environ.get("STAFF_SERVICE_URL", "http://staff-service:8000")
CATALOG_SERVICE_URL = os.environ.get("CATALOG_SERVICE_URL", "http://catalog-service:8000")


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer

    def get_queryset(self):
        qs = Product.objects.select_related(
            'book_detail', 'laptop_detail', 'fashion_detail'
        ).filter(is_active=True)

        product_type = self.request.query_params.get('product_type')
        if product_type:
            qs = qs.filter(product_type=product_type)

        catalog_id = self.request.query_params.get('catalog_id') or self.request.query_params.get('catalog')
        if catalog_id:
            qs = qs.filter(catalog_id=catalog_id)

        q = self.request.query_params.get('search') or self.request.query_params.get('q')
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(description__icontains=q))

        ordering = self.request.query_params.get('ordering')
        if ordering:
            allowed = {'id', 'name', 'price', 'stock', 'catalog_id', 'product_type', 'created_at'}
            fields = []
            for f in ordering.split(','):
                f = f.strip()
                clean = f.lstrip('-')
                if clean in allowed:
                    fields.append(f)
            if fields:
                qs = qs.order_by(*fields)

        return qs

    @action(detail=False, methods=['get'])
    def search(self, request):
        q = request.query_params.get('q', '')
        qs = Product.objects.filter(
            Q(name__icontains=q) | Q(description__icontains=q),
            is_active=True
        ).select_related('book_detail', 'laptop_detail', 'fashion_detail')
        return Response(ProductSerializer(qs, many=True).data)

    @action(detail=True, methods=['post'])
    def update_stock(self, request, pk=None):
        product = self.get_object()
        quantity = int(request.data.get('quantity', 0))
        product.stock += quantity
        if product.stock < 0:
            return Response({'error': 'Insufficient stock'}, status=status.HTTP_400_BAD_REQUEST)
        product.save(update_fields=['stock', 'updated_at'])
        return Response(ProductSerializer(product).data)


class BookCompatViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Backward-compatible ViewSet cho route /api/books/.
    Trả về format cũ (title, author, isbn...) để frontend không bị break.
    Mặc định chỉ trả sách (product_type=book), hỗ trợ filter thêm.
    """
    serializer_class = BookCompatSerializer

    def get_queryset(self):
        qs = Product.objects.select_related('book_detail').filter(is_active=True)

        product_type = self.request.query_params.get('product_type', 'book')
        qs = qs.filter(product_type=product_type)

        catalog_id = self.request.query_params.get('catalog_id') or self.request.query_params.get('catalog')
        if catalog_id:
            qs = qs.filter(catalog_id=catalog_id)

        q = self.request.query_params.get('search') or self.request.query_params.get('q')
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(description__icontains=q))

        ordering = self.request.query_params.get('ordering', '-created_at')
        allowed = {'id', 'name', 'price', 'stock', 'catalog_id', 'created_at'}
        fields = []
        for f in ordering.split(','):
            f = f.strip()
            if f.lstrip('-') in allowed:
                fields.append(f)
        if fields:
            qs = qs.order_by(*fields)

        return qs

    @action(detail=False, methods=['get'])
    def search(self, request):
        q = request.query_params.get('q', '')
        qs = Product.objects.filter(
            Q(name__icontains=q) | Q(description__icontains=q),
            product_type='book', is_active=True
        ).select_related('book_detail')
        return Response(BookCompatSerializer(qs, many=True).data)

    @action(detail=True, methods=['post'])
    def update_stock(self, request, pk=None):
        product = self.get_object()
        quantity = int(request.data.get('quantity', 0))
        product.stock += quantity
        if product.stock < 0:
            return Response({'error': 'Insufficient stock'}, status=status.HTTP_400_BAD_REQUEST)
        product.save(update_fields=['stock', 'updated_at'])
        return Response(BookCompatSerializer(product).data)
