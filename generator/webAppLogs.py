from datetime import datetime


def http_request_log(user, host, timestamp: datetime, path: str, method: str = "GET"):
    return f'{timestamp.isoformat()} {host.hostname} web: {user.username} {host.ip_address} "{method} {path} HTTP/1.1" 200'


def http_error_log(host, timestamp: datetime, status_code: int, path: str):
    return f'{timestamp.isoformat()} {host.hostname} web: - {host.ip_address} "GET {path} HTTP/1.1" {status_code}'


def suspicious_request_log(user, host, timestamp: datetime, path: str):
    return f'{timestamp.isoformat()} {host.hostname} web: {user.username} {host.ip_address} "GET {path} HTTP/1.1" 400'
