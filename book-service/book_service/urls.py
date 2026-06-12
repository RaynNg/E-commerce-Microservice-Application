from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include


def health_check(request):
    try:
        from django.db import connection
        connection.ensure_connection()
        db_status = "ok"
    except Exception:
        db_status = "error"
    return JsonResponse({"status": "ok", "service": "book-service", "db": db_status})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health_check, name="health-check"),
    path("api/", include("books.urls")),
]
