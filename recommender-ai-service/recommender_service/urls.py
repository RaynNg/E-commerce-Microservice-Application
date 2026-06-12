from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include
import os


def health_check(request):
    checks = {}

    # Database check
    try:
        from django.db import connection
        connection.ensure_connection()
        checks["database"] = "ok"
    except Exception as e:
        checks["database"] = f"error: {e}"

    # Neo4j check + node count
    try:
        from neo4j import GraphDatabase
        driver = GraphDatabase.driver(
            os.environ.get("NEO4J_URI", "bolt://neo4j:7687"),
            auth=(
                os.environ.get("NEO4J_USER", "neo4j"),
                os.environ.get("NEO4J_PASSWORD", "bookstore123"),
            ),
        )
        with driver.session() as session:
            result = session.run("MATCH (n) RETURN count(n) AS total")
            total = result.single()["total"]
        driver.close()
        checks["neo4j"] = "ok"
        checks["knowledge_graph_nodes"] = total
    except Exception as e:
        checks["neo4j"] = f"error: {e}"
        checks["knowledge_graph_nodes"] = 0

    # Model check
    try:
        import os as _os
        base = _os.path.join(_os.path.dirname(__file__), "..", "models", "model_best.pt")
        checks["recommendations_model"] = "ready" if _os.path.exists(base) else "not found"
    except Exception:
        checks["recommendations_model"] = "error"

    overall = "healthy" if checks.get("database") == "ok" else "degraded"
    return JsonResponse({
        "status": overall,
        "service": "recommender-ai-service",
        "version": "1.0.0",
        "checks": checks,
    })


urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health_check, name="health-check"),
    path("api/", include("recommender.urls")),
]
