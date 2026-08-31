# test_pipeline.py
import uuid
from datetime import datetime, timezone
from app.db.connection import SessionLocal
from app.services.event_service import insert_event

def run_test():
    db = SessionLocal()

    test_event = {
        "event_id": str(uuid.uuid4()),
        "source_id": "source_001",
        "timestamp": datetime.now(timezone.utc),
        "event_type": "LOGIN_FAILED",  # Or whatever event_type your rules look for
        "severity": "WARNING",
        "user": "test_user",
        "src_ip": "192.168.1.100",
        "message": "Failed authentication attempt",
        "metadata": {"attempt": 1}
    }

    print("Inserting test log into DB...")
    event = insert_event(db, test_event)
    print(f"Event inserted with ID: {event.id} (processed_for_detection={event.processed_for_detection})")

if __name__ == "__main__":
    run_test()