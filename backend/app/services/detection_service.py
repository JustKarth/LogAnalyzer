# app/services/detection_service.py
import logging
from sqlalchemy.orm import Session
from app.db.models import Event, Detection as DBDetection
from app.detection.engine import DetectionEngine

logger = logging.getLogger(__name__)

def process_unprocessed_events(db: Session, engine: DetectionEngine, batch_size: int = 100) -> int:
    """
    Fetches unprocessed events from the database, runs detection rules,
    saves alerts, and marks events as processed.
    """
    # 1. Query unprocessed events
    unprocessed_events = (
        db.query(Event)
        .filter(Event.processed_for_detection == False)
        .order_by(Event.id.asc())
        .limit(batch_size)
        .all()
    )

    if not unprocessed_events:
        return 0

    processed_ids = []

    for event in unprocessed_events:
        # 2. Format DB record into dict for DetectionEngine
        event_dict = {
            "id": event.id,
            "event_id": str(event.event_id),
            "source_id": event.source_id,
            "timestamp": event.timestamp,
            "event_type": event.event_type,
            "severity": event.severity,
            "user": event.user_name,
            "src_ip": str(event.src_ip) if event.src_ip is not None else None,
            "dst_ip": str(event.dst_ip) if event.dst_ip is not None else None,
            "host": event.host,
            "message": event.message,
            "metadata": event.event_metadata,
        }

        # 3. Evaluate rules using your main engine.
        # These are app.rules.models.Detection (Pydantic) instances, NOT db-layer rows.
        rule_detections = engine.process_event(event_dict)

        # 4. Map each rule-layer Detection into a db-layer Detection ORM row and save it
        for det in rule_detections:
            db_detection = DBDetection(
                rule_id=None,  # rule_id on the rule object is a string code (e.g. "RULE_001"),
                                # not the detection_rules.id FK; leave unset unless you map
                                # rule string codes -> detection_rules rows elsewhere.
                event_id=event.id,
                title=getattr(det, "detection_type", "Security Alert"),
                description=getattr(det, "description", ""),
                severity=getattr(det, "severity", "MEDIUM"),
                risk_score=int(getattr(det, "confidence", 0.5) * 100),
                metadata_=getattr(det, "metadata", {}),
            )
            db.add(db_detection)

        processed_ids.append(event.id)

    # 5. Mark batch as processed
    db.query(Event).filter(Event.id.in_(processed_ids)).update(
        {Event.processed_for_detection: True},
        synchronize_session=False
    )

    db.commit()
    return len(processed_ids)