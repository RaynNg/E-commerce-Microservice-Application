from django.http import JsonResponse
from django.urls import path
from .views import RecommendView, ModelRecommendView, ChatView, ChatbotView, BehaviorTrackView, ProductIndexStatusView


def health_check(request):
    checks = {}

    try:
        from django.db import connection
        connection.ensure_connection()
        checks["database"] = "ok"
    except Exception as e:
        checks["database"] = f"error: {e}"

    try:
        from neo4j import GraphDatabase
        import os
        driver = GraphDatabase.driver(
            os.environ.get("NEO4J_URI", "bolt://neo4j:7687"),
            auth=(os.environ.get("NEO4J_USER", "neo4j"), os.environ.get("NEO4J_PASSWORD", "bookstore123")),
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

    all_ok = all(str(v) == "ok" or isinstance(v, int) for v in checks.values())
    return JsonResponse({
        "status": "healthy" if all_ok else "degraded",
        "service": "recommender-ai-service",
        "version": "1.0.0",
        "checks": checks,
    })


urlpatterns = [
    path("recommendations/",         RecommendView.as_view(),      name="recommendations"),
    path("model-recommend/",          ModelRecommendView.as_view(), name="model-recommend"),
    path("chat/",                     ChatView.as_view(),           name="chat"),
    path("chatbot/",                  ChatbotView.as_view(),             name="chatbot"),
    path("chatbot/status/",           ProductIndexStatusView.as_view(), name="chatbot-status"),
    path("behavior/track/",           BehaviorTrackView.as_view(),      name="behavior-track"),
    path("health/",                   health_check,                 name="health-check"),
]
