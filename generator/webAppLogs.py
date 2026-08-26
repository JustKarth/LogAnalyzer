from datetime import datetime


def http_request_log(user, host, timestamp: datetime, path: str, method: str = "GET"):
    return {
        "timestamp": timestamp.isoformat(),
        "event_type": "HTTP_REQUEST",
        "user": user.username,
        "host": host.hostname,
        "src_ip": host.ip_address,
        "method": method,
        "path": path
    }


def http_error_log(host, timestamp: datetime, status_code: int, path: str):
    return {
        "timestamp": timestamp.isoformat(),
        "event_type": f"HTTP_{status_code}",
        "host": host.hostname,
        "path": path,
        "status_code": status_code
    }


def suspicious_request_log(user, host, timestamp: datetime, path: str):
    return {
        "timestamp": timestamp.isoformat(),
        "event_type": "SUSPICIOUS_REQUEST",
        "user": user.username,
        "host": host.hostname,
        "src_ip": host.ip_address,
        "path": path
    }