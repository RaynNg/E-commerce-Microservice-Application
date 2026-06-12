"""
JWT Authentication Middleware and decorators for cart-service.
Reads Authorization: Bearer <token>, verifies with shared secret.
Sets request.user_id and request.user_role on success.
"""
import json
import os
import functools

import jwt
from django.http import JsonResponse

JWT_SECRET    = os.environ.get("JWT_SECRET", "bookstore-jwt-secret-change-in-production")
JWT_ALGORITHM = "HS256"

BYPASS_PATHS = ("/health/", "/api/schema/", "/admin/")


class JWTAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method == "OPTIONS":
            return self.get_response(request)
        if any(request.path.startswith(p) for p in BYPASS_PATHS):
            return self.get_response(request)

        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        # Also accept forwarded user context from API Gateway
        if request.META.get("HTTP_X_USER_ID"):
            request.user_id   = request.META["HTTP_X_USER_ID"]
            request.user_role = request.META.get("HTTP_X_USER_ROLE", "")
            return self.get_response(request)

        if not auth_header.startswith("Bearer "):
            return JsonResponse({"error": "Authorization token required"}, status=401)

        token = auth_header[7:]
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            request.user_id   = payload.get("user_id")
            request.user_role = payload.get("role", "")
        except jwt.ExpiredSignatureError:
            return JsonResponse({"error": "Token expired"}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({"error": "Invalid token"}, status=401)

        return self.get_response(request)


def require_auth(view_func):
    """Decorator: require a valid JWT (user_id set by middleware)."""
    @functools.wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not getattr(request, "user_id", None):
            return JsonResponse({"error": "Authentication required"}, status=401)
        return view_func(request, *args, **kwargs)
    return wrapper


def require_role(*roles):
    """Decorator: require a specific role."""
    def decorator(view_func):
        @functools.wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not getattr(request, "user_id", None):
                return JsonResponse({"error": "Authentication required"}, status=401)
            if request.user_role not in roles:
                return JsonResponse({"error": "Permission denied"}, status=403)
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator
