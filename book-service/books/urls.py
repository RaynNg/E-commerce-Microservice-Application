from django.http import JsonResponse
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, BookCompatViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'books', BookCompatViewSet, basename='book')  # backward compat


def health_check(request):
    try:
        from django.db import connection
        connection.ensure_connection()
        db_status = "ok"
    except Exception:
        db_status = "error"
    return JsonResponse({"status": "ok", "service": "book-service", "db": db_status})


urlpatterns = [
    path('', include(router.urls)),
    path('health/', health_check, name='health-check'),
]
