from django.db import models


class ProductIndex(models.Model):
    """Index sản phẩm cho RAG — sync từ product-service."""
    product_id = models.IntegerField(unique=True)
    product_type = models.CharField(max_length=20)
    name = models.CharField(max_length=500)
    description = models.TextField()
    price = models.DecimalField(max_digits=12, decimal_places=0)
    catalog_id = models.IntegerField()
    catalog_name = models.CharField(max_length=255, blank=True)
    search_text = models.TextField()
    embedding_updated_at = models.DateTimeField(null=True, blank=True)
    raw_data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'product_index'

    def __str__(self):
        return f"[{self.product_type}] {self.name}"


class ChatHistory(models.Model):
    """Lịch sử chat để cải thiện chatbot."""
    customer_id = models.IntegerField()
    message = models.TextField()
    response = models.TextField()
    products_recommended = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chat_history'
        ordering = ['-created_at']


class UserBehavior(models.Model):
    ACTION_CHOICES = [
        ("view",        "View"),
        ("click",       "Click"),
        ("add_to_cart", "Add to Cart"),
        ("purchase",    "Purchase"),
    ]

    customer_id = models.PositiveIntegerField(db_index=True)
    book_id     = models.PositiveIntegerField(db_index=True)
    action      = models.CharField(max_length=20, choices=ACTION_CHOICES)
    created_at  = models.DateTimeField(auto_now_add=True)
    metadata    = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"UserBehavior(customer={self.customer_id}, book={self.book_id}, action={self.action})"
