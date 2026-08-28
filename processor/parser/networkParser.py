import re


def parse_network_log(raw_log: str) -> dict | None:
    raw_log = raw_log.strip()

    match = re.match(
        r'^(?P<timestamp>\S+) firewall: '
        r'(?P<action>ALLOW|BLOCK|PORT_ACCESS) '
        r'(?P<protocol>\S+) '
        r'(?P<src_ip>\S+) -> '
        r'(?P<dst_ip>\S+):(?P<dst_port>\d+)$',
        raw_log
    )

    if match:
        action = match.group("action")

        event_type = {
            "ALLOW": "CONNECTION_ALLOWED",
            "BLOCK": "CONNECTION_BLOCKED",
            "PORT_ACCESS": "PORT_ACCESS"
        }[action]

        return {
            "timestamp": match.group("timestamp"),
            "event_type": event_type,
            "src_ip": match.group("src_ip"),
            "dst_ip": match.group("dst_ip"),
            "dst_port": int(match.group("dst_port")),
            "protocol": match.group("protocol")
        }

    match = re.match(
        r'^(?P<timestamp>\S+) firewall: SUSPICIOUS '
        r'(?P<protocol>\S+) '
        r'(?P<src_ip>\S+) -> '
        r'(?P<dst_ip>\S+):(?P<dst_port>\d+) '
        r'\((?P<reason>.+)\)$',
        raw_log
    )

    if match:
        return {
            "timestamp": match.group("timestamp"),
            "event_type": "SUSPICIOUS_NETWORK_ACTIVITY",
            "src_ip": match.group("src_ip"),
            "dst_ip": match.group("dst_ip"),
            "dst_port": int(match.group("dst_port")),
            "protocol": match.group("protocol"),
            "reason": match.group("reason")
        }

    return None