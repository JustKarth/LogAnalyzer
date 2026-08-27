from datetime import datetime


def process_execution_log(user, host, timestamp: datetime, process: str):
    return {
        "timestamp": timestamp.isoformat(),
        "event_type": "PROCESS_EXECUTION",
        "user": user.username,
        "host": host.hostname,
        "process": process
    }


def process_stop_log(host, timestamp: datetime, process: str):
    return {
        "timestamp": timestamp.isoformat(),
        "event_type": "PROCESS_STOP",
        "host": host.hostname,
        "process": process
    }


def file_access_log(user, host, timestamp: datetime, filename: str):
    return {
        "timestamp": timestamp.isoformat(),
        "event_type": "FILE_ACCESS",
        "user": user.username,
        "host": host.hostname,
        "file": filename
    }