import re


def parse_server_log(raw_log: str) -> dict | None:
<<<<<<< HEAD
    match = re.match(
        r'^(?P<timestamp>\S+) (?P<host>\S+) process: (?P<user>\S+) executed (?P<process>\S+)$',
=======
    raw_log = raw_log.strip()

    match = re.match(
        r'^(?P<timestamp>\S+) (?P<host>\S+) process: '
        r'(?P<user>\S+) executed (?P<process>\S+)$',
>>>>>>> origin/main
        raw_log
    )

    if match:
        return {
            "timestamp": match.group("timestamp"),
            "host": match.group("host"),
            "event_type": "PROCESS_EXECUTION",
            "user": match.group("user"),
            "process": match.group("process")
        }

    match = re.match(
<<<<<<< HEAD
        r'^(?P<timestamp>\S+) (?P<host>\S+) process: stopped (?P<process>\S+)$',
=======
        r'^(?P<timestamp>\S+) (?P<host>\S+) process: '
        r'stopped (?P<process>\S+)$',
>>>>>>> origin/main
        raw_log
    )

    if match:
        return {
            "timestamp": match.group("timestamp"),
            "host": match.group("host"),
            "event_type": "PROCESS_STOP",
            "process": match.group("process")
        }

    match = re.match(
<<<<<<< HEAD
        r'^(?P<timestamp>\S+) (?P<host>\S+) file: (?P<user>\S+) accessed (?P<file>.+)$',
=======
        r'^(?P<timestamp>\S+) (?P<host>\S+) file: '
        r'(?P<user>\S+) accessed (?P<file>.+)$',
>>>>>>> origin/main
        raw_log
    )

    if match:
        return {
            "timestamp": match.group("timestamp"),
            "host": match.group("host"),
            "event_type": "FILE_ACCESS",
            "user": match.group("user"),
            "file": match.group("file")
        }

    return None