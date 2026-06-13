from rest_framework import serializers
from .models import Product, Book, Electronics, Fashion


class BookDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        exclude = ['id', 'product']


class ElectronicsDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Electronics
        exclude = ['id', 'product']


class FashionDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fashion
        exclude = ['id', 'product']


class ProductSerializer(serializers.ModelSerializer):
    detail = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'catalog_id', 'product_type', 'name', 'description',
            'price', 'stock', 'image_url', 'is_active', 'detail',
            'created_at', 'updated_at',
        ]

    def get_detail(self, obj):
        if obj.product_type == 'book' and hasattr(obj, 'book_detail'):
            return BookDetailSerializer(obj.book_detail).data
        elif obj.product_type == 'electronics' and hasattr(obj, 'electronics_detail'):
            return ElectronicsDetailSerializer(obj.electronics_detail).data
        elif obj.product_type == 'fashion' and hasattr(obj, 'fashion_detail'):
            return FashionDetailSerializer(obj.fashion_detail).data
        return {}


class BookCompatSerializer(serializers.ModelSerializer):
    """
    Backward-compatible serializer — trả về format giống model Book cũ
    (title, author, isbn...) để frontend và cart-service không bị break.
    """
    title = serializers.CharField(source='name')
    author = serializers.SerializerMethodField()
    isbn = serializers.SerializerMethodField()
    pages = serializers.SerializerMethodField()
    language = serializers.SerializerMethodField()
    publisher = serializers.SerializerMethodField()
    published_year = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'catalog_id', 'product_type',
            'title', 'author', 'isbn', 'pages', 'language', 'publisher', 'published_year',
            'description', 'price', 'stock', 'image_url', 'is_active',
            'created_at', 'updated_at',
        ]

    def _detail(self, obj):
        if obj.product_type == 'book' and hasattr(obj, 'book_detail'):
            return obj.book_detail
        return None

    def get_author(self, obj):
        d = self._detail(obj)
        return d.author if d else ''

    def get_isbn(self, obj):
        d = self._detail(obj)
        return d.isbn if d else ''

    def get_pages(self, obj):
        d = self._detail(obj)
        return d.pages if d else None

    def get_language(self, obj):
        d = self._detail(obj)
        return d.language if d else ''

    def get_publisher(self, obj):
        d = self._detail(obj)
        return d.publisher if d else ''

    def get_published_year(self, obj):
        d = self._detail(obj)
        return d.published_year if d else None
