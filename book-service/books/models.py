from django.db import models


class Product(models.Model):
    PRODUCT_TYPES = [
        ('book', 'Sách'),
        ('laptop', 'Laptop'),
        ('fashion', 'Quần áo'),
    ]
    catalog_id = models.IntegerField()
    product_type = models.CharField(max_length=20, choices=PRODUCT_TYPES, default='book')
    name = models.CharField(max_length=500)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=0)
    stock = models.IntegerField(default=0)
    image_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    created_by_staff_id = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'product'
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.product_type}] {self.name}"


class Book(models.Model):
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
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='laptop_detail')
    brand = models.CharField(max_length=100)
    cpu = models.CharField(max_length=200)
    ram = models.CharField(max_length=50)
    storage = models.CharField(max_length=100)
    display = models.CharField(max_length=100)
    gpu = models.CharField(max_length=200, blank=True)
    battery = models.CharField(max_length=100, blank=True)
    weight = models.FloatField(null=True, blank=True)
    os = models.CharField(max_length=100, default='Windows 11')
    warranty_months = models.IntegerField(default=12)

    class Meta:
        db_table = 'laptop_detail'


class Fashion(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='fashion_detail')
    brand = models.CharField(max_length=100, blank=True)
    sizes = models.JSONField(default=list)
    colors = models.JSONField(default=list)
    material = models.CharField(max_length=200, blank=True)
    gender = models.CharField(
        max_length=20,
        choices=[('male', 'Nam'), ('female', 'Nữ'), ('unisex', 'Unisex')],
        default='unisex'
    )
    season = models.CharField(max_length=100, blank=True)

    class Meta:
        db_table = 'fashion_detail'
