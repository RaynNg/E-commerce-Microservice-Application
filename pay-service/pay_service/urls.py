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

    rabbitmq_ok = "ok"
    try:
        import pika, os
        params = pika.URLParameters(os.environ.get("RABBITMQ_URL", "amqp://bookstore:bookstore@rabbitmq:5672/"))
        conn = pika.BlockingConnection(params)
        conn.close()
    except Exception as e:
        rabbitmq_ok = f"error: {e}"

    checks = {"database": db_ok, "rabbitmq": rabbitmq_ok}
    overall = "healthy" if all(v == "ok" for v in checks.values()) else "degraded"
    return JsonResponse({
        "status": overall,
        "service": "pay-service",
        "version": "1.0.0",
        "checks": checks,
    })


urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health_check, name="health-check"),
    path("api/", include("payments.urls")),
]
