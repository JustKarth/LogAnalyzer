from datetime import datetime, timedelta, timezone
import json
from typing import Any, Dict, Tuple

from app.rules.base import DetectionContext


class InMemoryDetectionContext(DetectionContext):
    """
    In-memory implementation of DetectionContext for local testing & unit tests.
    No Redis installation or connection required.
    """

    def __init__(self):
        # Stores (value_as_json_string, expiry_datetime_or_None)
        self._store: Dict[str, Tuple[str, datetime | None]] = {}

    def get_state(self, key: str) -> Any:
        if key not in self._store:
            return None

        val_str, expires_at = self._store[key]

        # Check for TTL expiration
        if expires_at and datetime.now(timezone.utc) > expires_at:
            del self._store[key]
            return None

        try:
            return json.loads(val_str)
        except (json.JSONDecodeError, TypeError):
            return val_str

    def set_state(
        self,
        key: str,
        value: Any,
        *,
        ttl: int | None = None,
    ) -> None:
        expires_at = None
        if ttl is not None:
            expires_at = datetime.now(timezone.utc) + timedelta(seconds=ttl)

        # Serialize sets/dicts/lists to match Redis JSON serialization behavior
        if isinstance(value, (dict, list, set)):
            serialized = json.dumps(list(value) if isinstance(value, set) else value)
        else:
            serialized = str(value)

        self._store[key] = (serialized, expires_at)