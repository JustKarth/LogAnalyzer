import re


def parse_auth_log(raw_log: str) -> dict | None:
    patterns = [
        (
            "LOGIN_SUCCESS",
            re.compile(
                r'^(?P<timestamp>\S+) (?P<host>\S+) sshd\[\d+\]: '
                r'Accepted password for (?P<user>\S+) from (?P<src_ip>\S+)$'
            )
        ),
        (
            "LOGIN_FAILURE",
            re.compile(
                r'^(?P<timestamp>\S+) (?P<host>\S+) sshd\[\d+\]: '
                r'Failed password for (?P<user>\S+) from (?P<src_ip>\S+)$'
            )
        ),
        (
            "LOGOUT",
            re.compile(
                r'^(?P<timestamp>\S+) (?P<host>\S+) sshd\[\d+\]: '
                r'User (?P<user>\S+) logged out$'
            )
        ),
        (
            "PRIVILEGE_CHANGE",
            re.compile(
                r'^(?P<timestamp>\S+) (?P<host>\S+) sudo: '
                r'(?P<user>\S+) changed privilege from '
                r'(?P<old_privilege>\S+) to (?P<new_privilege>\S+)$'
            )
        ),
    ]

    raw_log = raw_log.strip()

    for event_type, pattern in patterns:
        match = pattern.match(raw_log)

        if match:
            data = match.groupdict()

            return {
                "timestamp": data["timestamp"],
                "event_type": event_type,
                "user": data.get("user"),
                "src_ip": data.get("src_ip"),
                "host": data.get("host"),
                "old_privilege": data.get("old_privilege"),
                "new_privilege": data.get("new_privilege")
            }

    return None