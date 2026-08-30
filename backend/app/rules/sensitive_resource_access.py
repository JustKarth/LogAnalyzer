from datetime import datetime, timezone
import uuid

from app.rules.models import Detection, DetectionSeverity
from app.rules.base import DetectionContext, DetectionRule


class SensitiveResourceAccessRule(DetectionRule):
    rule_id = "RULE_004"
    name = "Sensitive Resource Access"
    description = (
        "Triggers when a user or process accesses a known sensitive "
        "resource such as credentials, private keys, or security configuration."
    )

    SENSITIVE_PATHS = {
        "/etc/shadow",
        "/etc/sudoers",
        "/root/.ssh/id_rsa",
        "/root/.ssh/authorized_keys",
    }

    SENSITIVE_RESOURCE_TYPES = {
        "CREDENTIALS",
        "SECRET",
        "PRIVATE_KEY",
        "SECURITY_CONFIG",
    }

    SENSITIVE_ACTIONS = {
        "READ",
        "WRITE",
        "DELETE",
        "MODIFY",
        "DOWNLOAD",
    }

    def evaluate(
        self,
        event: dict,
        context: DetectionContext,
    ) -> Detection | None:

        event_type = event.get("event_type")

        # We only care about resource/file access events.
        if event_type not in {
            "FILE_ACCESS",
            "RESOURCE_ACCESS",
            "FILE_READ",
            "FILE_WRITE",
        }:
            return None

        metadata = event.get("metadata", {})

        user = event.get("user")
        host = event.get("host", "unknown")

        # NOTE: this generator's FILE_ACCESS events use the key "file",
        # not "path". Falling back to "path" too in case that key ever
        # gets added later (e.g. a richer generator or a different source).
        path = metadata.get("file") or metadata.get("path")
        resource_type = metadata.get("resource_type")
        action = metadata.get("action")

        # Check whether the accessed resource is sensitive.
        sensitive_resource = (
            path in self.SENSITIVE_PATHS
            or resource_type in self.SENSITIVE_RESOURCE_TYPES
        )

        if not sensitive_resource:
            return None

        # If an action is provided, make sure it is a relevant access.
        if action and action.upper() not in self.SENSITIVE_ACTIONS:
            return None

        # Keep temporary state indicating that this user accessed
        # a sensitive resource on this host.
        state_key = f"sensitive_access:{host}:{user}"

        context.set_state(
            state_key,
            {
                "resource": path or resource_type,
                "action": action,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
            ttl=300,
        )

        return Detection(
            detection_id=f"det_{uuid.uuid4().hex[:8]}",
            rule_id=self.rule_id,
            detection_type="SENSITIVE_RESOURCE_ACCESS",
            timestamp=datetime.now(timezone.utc),
            severity=DetectionSeverity.HIGH,
            confidence=0.90,
            event_ids=[event["event_id"]],
            description=(
                f"Sensitive resource access detected by user "
                f"'{user}' on host '{host}'."
            ),
            metadata={
                "user": user,
                "host": host,
                "path": path,
                "resource_type": resource_type,
                "action": action,
            },
        )