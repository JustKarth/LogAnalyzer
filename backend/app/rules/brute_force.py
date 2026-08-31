from datetime import datetime, timezone
import uuid

from app.rules.models import Detection, DetectionSeverity
from app.rules.base import DetectionContext, DetectionRule


class BruteForceRule(DetectionRule):
    rule_id = "RULE_001"
    name = "Brute Force Login Attempt"
    description = "Triggers when threshold of failed logins from a single IP is exceeded within a time window."

    # Renamed threshold -> failure_threshold
    def __init__(self, failure_threshold: int = 5, window_seconds: int = 60):
        self.threshold = failure_threshold
        self.window_seconds = window_seconds
        
    def evaluate(self, event: dict, context: DetectionContext) -> Detection | None:
        # Check if the event is a login failure
        if event.get("event_type") != "LOGIN_FAILURE":
            return None

        src_ip = event.get("src_ip")
        if not src_ip:
            return None

        state_key = f"brute_force:{src_ip}"
        
        # Track counts in context (e.g., Redis implementation)
        current_count = context.get_state(state_key) or 0
        current_count += 1
        context.set_state(state_key, current_count, ttl=self.window_seconds)

        if current_count >= self.threshold:
            return Detection(
                detection_id=f"det_{uuid.uuid4().hex[:8]}",
                rule_id=self.rule_id,
                detection_type="BRUTE_FORCE",
                timestamp=datetime.now(timezone.utc),
                severity=DetectionSeverity.HIGH,
                confidence=0.9,
                event_ids=[event["event_id"]],
                description=f"Multiple failed logins ({current_count}) detected from IP {src_ip}.",
                metadata={"src_ip": src_ip, "attempt_count": current_count},
            )

        return None