import json
from typing import Any
import redis

from app.rules.base import DetectionContext


class RedisDetectionContext(DetectionContext):
    """
    Concrete implementation of DetectionContext backed by Redis.
    Allows detection rules to track state across sliding time windows.
    """

    def __init__(self, redis_client: redis.Redis, namespace: str = "detection_state"):
        self.redis = redis_client
        self.namespace = namespace

    def _format_key(self, key: str) -> str:
        return f"{self.namespace}:{key}"

    def get_state(self, key: str) -> Any:
        full_key = self._format_key(key)
        val = self.redis.get(full_key)
        if val is None:
            return None

        try:
            return json.loads(val.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            return val.decode("utf-8")

    def set_state(
        self,
        key: str,
        value: Any,
        *,
        ttl: int | None = None,
    ) -> None:
        full_key = self._format_key(key)
        
        if isinstance(value, (dict, list, set)):
            serialized = json.dumps(list(value) if isinstance(value, set) else value)
        else:
            serialized = str(value)

        if ttl:
            self.redis.setex(name=full_key, time=ttl, value=serialized)
        else:
            self.redis.set(name=full_key, value=serialized)