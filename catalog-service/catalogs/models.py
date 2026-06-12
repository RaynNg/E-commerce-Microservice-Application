from django.db import models


class Catalog(models.Model):
    PRODUCT_TYPES = [
        ('book', 'Sách'),
        ('laptop', 'Laptop & Thiết bị điện tử'),
        ('fashion', 'Thời trang'),
    ]
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    icon = models.CharField(max_length=20, blank=True, default="📚")
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
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.product_type})"
