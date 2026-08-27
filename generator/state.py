from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional

@dataclass
class User:
    id: str
    username: str
    privilege: str = "USER"

    logged_in: bool = False
    current_host: Optional[str] = None

    failed_login_count: int = 0
    last_login: Optional[datetime] = None

@dataclass
class Host:
    id: str
    hostname: str
    ip_address: str
    host_type: str
    running_services: list[str] = field(default_factory=list)
    active_users: list[str] = field(default_factory=list)
    running_processes: list[str] = field(default_factory=list)
    files: list[str] = field(default_factory=list)


@dataclass
class Session:
    id: str
    user_id: str
    host_id: str

    active: bool = True
    started_at: Optional[datetime] = None


@dataclass
class NetworkConnection:
    source_ip: str
    destination_ip: str
    destination_port: int

    protocol: str = "TCP"
    active: bool = True

@dataclass
class SimulationState:
    users: dict[str, User] = field(default_factory=dict)
    hosts: dict[str, Host] = field(default_factory=dict)
    sessions: dict[str, Session] = field(default_factory=dict)
    connections: list[NetworkConnection] = field(default_factory=list)

    current_time: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    next_session_id: int = 1

    def add_user(self, user: User):
        self.users[user.id] = user

    def add_host(self, host: Host):
        self.hosts[host.id] = host

    def add_session(self, session: Session):
        self.sessions[session.id] = session