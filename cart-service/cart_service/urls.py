from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include


def health_check(request):
    try:
        from django.db import connection
        connection.ensure_connection()
        db_ok = "ok"
    except Exception as e:
        db_ok = f"error: {e}"
    overall = "healthy" if db_ok == "ok" else "degraded"
    return JsonResponse({
        "status": overall,
        "service": "cart-service",
        "version": "1.0.0",
        "checks": {"database": db_ok},
    })


urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health_check, name="health-check"),
    path("api/", include("carts.urls")),
]
