from sqlalchemy.orm import Session

from app.db.models import Event


def insert_event(db: Session, event: dict) -> Event:
    db_event = Event(
        event_id=event["event_id"],
        source_id=event.get("source_id"),
        timestamp=event["timestamp"],
        event_type=event["event_type"],
        severity=event.get("severity"),
        user_name=event.get("user"),
        src_ip=event.get("src_ip"),
        dst_ip=event.get("dst_ip"),
        host=event.get("host"),
        message=event.get("message"),
        event_metadata=event.get("metadata", {})
    )

    db.add(db_event)
    db.commit()
    db.refresh(db_event)

    return db_event