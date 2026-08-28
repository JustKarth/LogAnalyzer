from datetime import datetime


def allowed_connection_log(timestamp: datetime, source_ip: str, destination_ip: str, destination_port: int, protocol: str):
        return f'{timestamp.isoformat()} firewall: ALLOW {protocol} {source_ip} -> {destination_ip}:{destination_port}'


def blocked_connection_log(timestamp: datetime, source_ip: str, destination_ip: str, destination_port: int, protocol: str):
        return f'{timestamp.isoformat()} firewall: BLOCK {protocol} {source_ip} -> {destination_ip}:{destination_port}'


def port_access_log(timestamp: datetime, source_ip: str, destination_ip: str, destination_port: int, protocol: str):
        return f'{timestamp.isoformat()} firewall: PORT_ACCESS {protocol} {source_ip} -> {destination_ip}:{destination_port}'


def suspicious_network_log(timestamp: datetime, source_ip: str, destination_ip: str, destination_port: int, reason: str, protocol: str = "TCP"):
        return f'{timestamp.isoformat()} firewall: SUSPICIOUS {protocol} {source_ip} -> {destination_ip}:{destination_port} ({reason})'