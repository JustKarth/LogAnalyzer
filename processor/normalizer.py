import uuid
from datetime import datetime


def normalize_event(
    parsed_event: dict,
    source_id: str,
    source_type: str,
    raw_log: str
) -> dict:

    known_fields = {
        "timestamp",
        "event_type",
        "user",
        "src_ip",
        "dst_ip",
        "host",
        "severity"
    }

    metadata = {
        key: value
        for key, value in parsed_event.items()
        if key not in known_fields and value is not None
    }

    return {
        "event_id": str(uuid.uuid4()),
        "timestamp": datetime.fromisoformat(parsed_event["timestamp"]),
        "source_id": source_id,
        "source_type": source_type,
        "host": parsed_event.get("host"),
        "event_type": parsed_event["event_type"],
        "severity": parsed_event.get("severity"),
        "user": parsed_event.get("user"),
        "src_ip": parsed_event.get("src_ip"),
        "dst_ip": parsed_event.get("dst_ip"),
        "message": raw_log,
        "metadata": metadata
    }