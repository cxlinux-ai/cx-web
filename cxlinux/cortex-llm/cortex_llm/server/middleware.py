"""Server middleware."""

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


class APIKeyMiddleware(BaseHTTPMiddleware):
    """API key authentication middleware."""

    def __init__(self, app, api_key: str) -> None:
        super().__init__(app)
        self.api_key = api_key

    async def dispatch(self, request: Request, call_next) -> Response:
        # Skip auth for health and docs
        if request.url.path in ["/health", "/docs", "/redoc", "/openapi.json"]:
            return await call_next(request)

        # Check API key
        auth_header = request.headers.get("Authorization", "")
        api_key_header = request.headers.get("X-API-Key", "")

        if auth_header.startswith("Bearer "):
            provided_key = auth_header[7:]
        elif api_key_header:
            provided_key = api_key_header
        else:
            return Response(
                content='{"detail": "Missing API key"}',
                status_code=401,
                media_type="application/json",
            )

        if provided_key != self.api_key:
            return Response(
                content='{"detail": "Invalid API key"}',
                status_code=401,
                media_type="application/json",
            )

        return await call_next(request)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple rate limiting middleware."""

    def __init__(
        self,
        app,
        requests_per_minute: int = 60,
    ) -> None:
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self._requests: dict[str, list[float]] = {}

    async def dispatch(self, request: Request, call_next) -> Response:
        import time

        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()
        window_start = current_time - 60

        # Clean old requests
        if client_ip in self._requests:
            self._requests[client_ip] = [
                t for t in self._requests[client_ip]
                if t > window_start
            ]
        else:
            self._requests[client_ip] = []

        # Check rate limit
        if len(self._requests[client_ip]) >= self.requests_per_minute:
            return Response(
                content='{"detail": "Rate limit exceeded"}',
                status_code=429,
                media_type="application/json",
            )

        # Record request
        self._requests[client_ip].append(current_time)

        return await call_next(request)
