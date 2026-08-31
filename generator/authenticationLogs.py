from datetime import datetime


def login_success_log(user, host, timestamp: datetime):
    return f'{timestamp.isoformat()} {host.hostname} sshd[1234]: Accepted password for {user.username} from {host.ip_address}'


def login_failure_log(user, host, timestamp: datetime):
    return f'{timestamp.isoformat()} {host.hostname} sshd[1234]: Failed password for {user.username} from {host.ip_address}'


def logout_log(user, host, timestamp: datetime):
    return f'{timestamp.isoformat()} {host.hostname} sshd[1234]: User {user.username} logged out'


def privilege_change_log(user, host, timestamp: datetime, old_priv: str, new_priv: str):
    return f'{timestamp.isoformat()} {host.hostname} sudo: {user.username} changed privilege from {old_priv} to {new_priv}'
