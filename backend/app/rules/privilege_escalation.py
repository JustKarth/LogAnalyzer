from datetime import datetime, timezone
import uuid

from app.detection.models import Detection, DetectionSeverity
from app.detection.rules.base import DetectionContext, DetectionRule


class PrivilegeEscalationRule(DetectionRule):
    rule_id = "RULE_002"
    name = "Privilege Escalation Attempt"
    description = "Triggers when a standard user account performs unauthorized privilege changes or runs administrative commands."

    # List of common privilege elevation event types or commands
    ELEVATION_EVENTS = {"PRIVILEGE_CHANGE", "SUDO_EXEC", "RUNAS_ADMIN"}
    SENSITIVE_TARGETS = {"root", "administrator", "SYSTEM"}

    def evaluate(self, event: dict, context: DetectionContext) -> Detection | None:
        event_type = event.get("event_type")
        
        # Filter for privilege-related events
        if event_type not in self.ELEVATION_EVENTS:
            return None

        user = event.get("user")
        target_user = event.get("metadata", {}).get("target_user")
        command = event.get("metadata", {}).get("command")

        # Trigger condition: Escalating to a sensitive account (e.g., root/admin)
        if target_user in self.SENSITIVE_TARGETS or (command and "sudo" in command.lower()):
            
            # Optionally log state context if tracking elevation frequency per host
            host = event.get("host", "unknown")
            state_key = f"priv_esc:{host}:{user}"
            context.set_state(state_key, datetime.now(timezone.utc).isoformat(), ttl=300)

            return Detection(
                detection_id=f"det_{uuid.uuid4().hex[:8]}",
                rule_id=self.rule_id,
                detection_type="PRIVILEGE_ESCALATION",
                timestamp=datetime.now(timezone.utc),
                severity=DetectionSeverity.HIGH,
                confidence=0.85,
                event_ids=[event["event_id"]],
                description=f"Privilege escalation attempt detected by user '{user}' to '{target_user or 'privileged access'}'.",
                metadata={
                    "user": user,
                    "target_user": target_user,
                    "command": command,
                    "host": host,
                },
            )

        return None