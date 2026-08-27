from datetime import datetime, timezone
import uuid

from app.detection.models import Detection, DetectionSeverity
from app.detection.rules.base import DetectionContext, DetectionRule


class PortScanRule(DetectionRule):
    rule_id = "RULE_003"
    name = "Port Scanning Detection"
    description = "Triggers when a single source IP attempts to access multiple distinct destination ports within a short time window."

    def __init__(self, port_threshold: int = 10, window_seconds: int = 60):
        self.port_threshold = port_threshold
        self.window_seconds = window_seconds

    def evaluate(self, event: dict, context: DetectionContext) -> Detection | None:
        # Check for network connection attempt events
        if event.get("event_type") not in {"CONNECTION_ATTEMPT", "FIREWALL_REJECT", "PORT_ACCESS"}:
            return None

        src_ip = event.get("src_ip")
        dst_port = event.get("metadata", {}).get("dst_port")

        if not src_ip or dst_port is None:
            return None

        state_key = f"port_scan:{src_ip}"
        
        # Retrieve stored set of unique ports, or initialize empty set
        visited_ports = set(context.get_state(state_key) or [])
        visited_ports.add(dst_port)

        # Store updated unique port list back in context
        context.set_state(state_key, list(visited_ports), ttl=self.window_seconds)

        unique_port_count = len(visited_ports)

        if unique_port_count >= self.port_threshold:
            return Detection(
                detection_id=f"det_{uuid.uuid4().hex[:8]}",
                rule_id=self.rule_id,
                detection_type="PORT_SCAN",
                timestamp=datetime.now(timezone.utc),
                severity=DetectionSeverity.MEDIUM,
                confidence=0.85,
                event_ids=[event["event_id"]],
                description=f"Port scanning activity detected from IP {src_ip} ({unique_port_count} unique ports accessed).",
                metadata={
                    "src_ip": src_ip,
                    "unique_ports_scanned": unique_port_count,
                    "target_host": event.get("host"),
                },
            )

        return None