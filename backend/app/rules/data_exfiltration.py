from datetime import datetime, timezone
import uuid

from app.rules.models import Detection, DetectionSeverity
from app.rules.base import DetectionContext, DetectionRule


class PossibleDataExfiltrationRule(DetectionRule):
    rule_id = "RULE_005"
    name = "Possible Data Exfiltration"
    description = (
        "Triggers when an unusually large amount of data is transferred "
        "from an internal host to an external destination within a short time window."
    )

    # Detection window and threshold.
    WINDOW_SECONDS = 300
    BYTE_THRESHOLD = 100 * 1024 * 1024  # 100 MB

    NETWORK_EVENTS = {
        "NETWORK_CONNECTION",
        "NETWORK_TRANSFER",
        "DATA_TRANSFER",
        "OUTBOUND_TRANSFER",
    }

    def evaluate(
        self,
        event: dict,
        context: DetectionContext,
    ) -> Detection | None:

        event_type = event.get("event_type")

        # Ignore events that aren't related to network/data transfer.
        if event_type not in self.NETWORK_EVENTS:
            return None

        metadata = event.get("metadata", {})

        source_ip = event.get("source_ip") or metadata.get("source_ip")
        destination_ip = (
            event.get("destination_ip")
            or metadata.get("destination_ip")
        )

        bytes_transferred = metadata.get("bytes_transferred", 0)

        # We need both endpoints and a valid byte count.
        if not source_ip or not destination_ip:
            return None

        try:
            bytes_transferred = int(bytes_transferred)
        except (TypeError, ValueError):
            return None

        if bytes_transferred <= 0:
            return None

        # We are interested in outbound traffic to external destinations.
        if self._is_internal_ip(destination_ip):
            return None

        # Keep a running byte count for this source/destination pair.
        state_key = f"exfil:{source_ip}:{destination_ip}"

        state = context.get_state(state_key)

        if not state:
            state = {
                "total_bytes": 0,
                "event_ids": [],
            }

        total_bytes = state.get("total_bytes", 0) + bytes_transferred

        event_ids = state.get("event_ids", [])
        event_id = event.get("event_id")

        if event_id:
            event_ids.append(event_id)

        # If the threshold hasn't been reached, update state and continue.
        if total_bytes < self.BYTE_THRESHOLD:
            context.set_state(
                state_key,
                {
                    "total_bytes": total_bytes,
                    "event_ids": event_ids,
                },
                ttl=self.WINDOW_SECONDS,
            )

            return None

        # Threshold exceeded → generate a detection.
        detection = Detection(
            detection_id=f"det_{uuid.uuid4().hex[:8]}",
            rule_id=self.rule_id,
            detection_type="POSSIBLE_DATA_EXFILTRATION",
            timestamp=datetime.now(timezone.utc),
            severity=DetectionSeverity.HIGH,
            confidence=0.80,
            event_ids=event_ids,
            description=(
                f"Possible data exfiltration detected from "
                f"'{source_ip}' to external destination "
                f"'{destination_ip}'."
            ),
            metadata={
                "source_ip": source_ip,
                "destination_ip": destination_ip,
                "bytes_transferred": total_bytes,
                "threshold_bytes": self.BYTE_THRESHOLD,
                "window_seconds": self.WINDOW_SECONDS,
            },
        )

        # Reset the state after triggering so the same transfer
        # doesn't continuously generate detections.
        context.set_state(
            state_key,
            {
                "total_bytes": 0,
                "event_ids": [],
            },
            ttl=self.WINDOW_SECONDS,
        )

        return detection

    @staticmethod
    def _is_internal_ip(ip: str) -> bool:
        """
        Determine whether an IP belongs to a common private network range.
        """

        private_prefixes = (
            "10.",
            "192.168.",
        )

        if ip.startswith(private_prefixes):
            return True

        # 172.16.0.0 - 172.31.255.255
        if ip.startswith("172."):
            try:
                second_octet = int(ip.split(".")[1])
                return 16 <= second_octet <= 31
            except (IndexError, ValueError):
                return False

        return False