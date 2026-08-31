from state import SimulationState, Session, NetworkConnection

def login(state: SimulationState, user_id: str, host_id: str):
    user = state.users.get(user_id)
    host = state.hosts.get(host_id)

    if user is None or host is None:
        return None

    if user.logged_in:
        return None

    session_id = f"session_{state.next_session_id:03d}"
    state.next_session_id += 1

    session = Session(id=session_id, user_id=user.id, host_id=host.id, started_at=state.current_time)

    user.logged_in = True
    user.current_host = host.id
    user.last_login = state.current_time
    user.failed_login_count = 0

    host.active_users.append(user.id)

    state.add_session(session)

    return session


def logout(state: SimulationState, user_id: str):
    user = state.users.get(user_id)

    if user is None:
        return False

    if not user.logged_in:
        return False

    host = state.hosts[user.current_host]

    if user.id in host.active_users:
        host.active_users.remove(user.id)

    for session in state.sessions.values():
        if session.user_id == user.id and session.active:
            session.active = False

    user.logged_in = False
    user.current_host = None

    return True


def failed_login(state: SimulationState, user_id: str):
    user = state.users.get(user_id)

    if user is None:
        return False

    user.failed_login_count += 1

    return True


def privilege_change(state: SimulationState, user_id: str, new_privilege: str):
    user = state.users.get(user_id)

    if user is None:
        return False

    user.privilege = new_privilege

    return True

def execute_process(state: SimulationState, user_id: str, host_id: str, process: str) -> bool:
    user = state.users.get(user_id)
    host = state.hosts.get(host_id)

    if user is None or host is None or not user.logged_in:
        return False

    if process not in host.running_processes:
        host.running_processes.append(process)

    return True


def stop_process(state: SimulationState, host_id: str, process: str) -> bool:
    host = state.hosts.get(host_id)

    if host is None or process not in host.running_processes:
        return False

    host.running_processes.remove(process)
    return True


def access_file(state: SimulationState, user_id: str, host_id: str, filename: str) -> bool:
    user = state.users.get(user_id)
    host = state.hosts.get(host_id)

    if user is None or host is None or not user.logged_in:
        return False

    if filename not in host.files:
        host.files.append(filename)

    return True

def http_request(state: SimulationState, user_id: str, host_id: str, path: str) -> bool:
    user = state.users.get(user_id)
    host = state.hosts.get(host_id)

    if user is None or host is None or not user.logged_in:
        return False

    return True

def network_connection(state: SimulationState, source_ip: str, destination_ip: str, destination_port: int, protocol: str = "TCP") -> bool:
    connection = NetworkConnection(
        source_ip=source_ip,
        destination_ip=destination_ip,
        destination_port=destination_port,
        protocol=protocol
    )

    state.connections.append(connection)
    return True


def close_network_connection(state: SimulationState, source_ip: str, destination_ip: str, destination_port: int) -> bool:
    for connection in state.connections:
        if (
            connection.source_ip == source_ip
            and connection.destination_ip == destination_ip
            and connection.destination_port == destination_port
            and connection.active
        ):
            connection.active = False
            return True

    return False