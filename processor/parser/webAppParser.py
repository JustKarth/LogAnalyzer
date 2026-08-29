import re


def parse_web_app_log(raw_log: str) -> dict | None:
    raw_log = raw_log.strip()

    match = re.match(
        r'^(?P<timestamp>\S+) (?P<host>\S+) web: '
        r'(?P<user>\S+) (?P<src_ip>\S+) '
        r'"(?P<method>\S+) (?P<path>\S+) HTTP/\S+" '
        r'(?P<status>\d+)$',
        raw_log
    )

    if not match:
        return None

    status = int(match.group("status"))

    if status == 200:
        event_type = "HTTP_REQUEST"
    elif status in (401, 403, 500):
        event_type = f"HTTP_{status}"
    elif status == 400:
        event_type = "SUSPICIOUS_REQUEST"
    else:
        event_type = f"HTTP_{status}"

    return {
        "timestamp": match.group("timestamp"),
        "host": match.group("host"),
        "event_type": event_type,
        "user": (
            match.group("user")
            if match.group("user") != "-"
            else None
        ),
        "src_ip": match.group("src_ip"),
        "method": match.group("method"),
        "path": match.group("path"),
        "status_code": status
    }