from datetime import datetime


def allowed_connection_log(timestamp: datetime, source_ip: str, destination_ip: str, destination_port: int, protocol: str):
    return {
        "timestamp": timestamp.isoformat(),
        "event_type": "CONNECTION_ALLOWED",
        "src_ip": source_ip,
        "dst_ip": destination_ip,
        "dst_port": destination_port,
        "protocol": protocol
    }


def blocked_connection_log(timestamp: datetime, source_ip: str, destination_ip: str, destination_port: int, protocol: str):
    return {
        "timestamp": timestamp.isoformat(),
        "event_type": "CONNECTION_BLOCKED",
        "src_ip": source_ip,
        "dst_ip": destination_ip,
        "dst_port": destination_port,
        "protocol": protocol
    }


def port_access_log(timestamp: datetime, source_ip: str, destination_ip: str, destination_port: int, protocol: str):
    return {
        "timestamp": timestamp.isoformat(),
        "event_type": "PORT_ACCESS",
        "src_ip": source_ip,
        "dst_ip": destination_ip,
        "dst_port": destination_port,
        "protocol": protocol
    }


def suspicious_network_log(timestamp: datetime, source_ip: str, destination_ip: str, destination_port: int, reason: str):
    return {
        "timestamp": timestamp.isoformat(),
        "event_type": "SUSPICIOUS_NETWORK_ACTIVITY",
        "src_ip": source_ip,
        "dst_ip": destination_ip,
        "dst_port": destination_port,
        "reason": reason
    }