from datetime import datetime


def login_success_log(user, host, timestamp: datetime):
    return {
        "timestamp": timestamp.isoformat(),
        "event_type": "LOGIN_SUCCESS",
        "user": user.username,
        "host": host.hostname,
        "src_ip": host.ip_address
    }


def login_failure_log(user, host, timestamp: datetime):
    return {
        "timestamp": timestamp.isoformat(),
        "event_type": "LOGIN_FAILURE",
        "user": user.username,
        "host": host.hostname,
        "src_ip": host.ip_address
    }


def logout_log(user, host, timestamp: datetime):
    return {
        "timestamp": timestamp.isoformat(),
        "event_type": "LOGOUT",
        "user": user.username,
        "host": host.hostname
    }


def privilege_change_log(user, host, timestamp: datetime, old_priv: str, new_priv: str):
    return {
        "timestamp": timestamp.isoformat(),
        "event_type": "PRIVILEGE_CHANGE",
        "user": user.username,
        "host": host.hostname,
        "old_privilege": old_priv,
        "new_privilege": new_priv
    }