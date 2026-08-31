from datetime import datetime


def process_execution_log(user, host, timestamp: datetime, process: str):
    return f'{timestamp.isoformat()} {host.hostname} process: {user.username} executed {process}'


def process_stop_log(host, timestamp: datetime, process: str):
    return f'{timestamp.isoformat()} {host.hostname} process: stopped {process}'


def file_access_log(user, host, timestamp: datetime, filename: str):
    return f'{timestamp.isoformat()} {host.hostname} file: {user.username} accessed {filename}'
