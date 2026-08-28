import argparse
import random
import time
from datetime import datetime, timezone, timedelta

from state import SimulationState, User, Host
from actions import login, logout, failed_login, execute_process, access_file, network_connection

from authenticationLogs import login_success_log, login_failure_log, logout_log
from serverLogs import process_execution_log, file_access_log
from webAppLogs import http_request_log, http_error_log, suspicious_request_log
from networkLogs import allowed_connection_log, blocked_connection_log, suspicious_network_log
from output import print_event
from publisher import publish_event
from scenarios import brute_force_attack, choose_attack_target

def create_users(state: SimulationState, count: int):
    for i in range(1, count + 1):
        user = User(
            id=f"user_{i:03d}",
            username=f"user{i:03d}",
            privilege="ADMIN" if i == 1 else "USER"
        )
        state.add_user(user)


def create_hosts(state: SimulationState, count: int):
    for i in range(1, count + 1):
        host = Host(
            id=f"host_{i:03d}",
            hostname=f"host-{i:03d}",
            ip_address=f"10.0.0.{i}",
            host_type="WORKSTATION",
            running_services=["ssh", "http"],
            files=[
                "/home/user/document.txt",
                "/var/log/system.log"
            ]
        )
        state.add_host(host)


def create_initial_state(user_count: int, host_count: int):
    state = SimulationState()
    create_users(state, user_count)
    create_hosts(state, host_count)
    return state


def choose_logged_in_user(state: SimulationState):
    users = [user for user in state.users.values() if user.logged_in]
    return random.choice(users) if users else None


def choose_host(state: SimulationState):
    return random.choice(list(state.hosts.values()))


def generate_auth_event(state: SimulationState):
    user = random.choice(list(state.users.values()))
    host = choose_host(state)

    if user.logged_in:
        if random.random() < 0.15:
            host = state.hosts[user.current_host]
            logout(state, user.id)
            return logout_log(user, host, state.current_time)

        return None

    if random.random() < 0.8:
        session = login(state, user.id, host.id)

        if session:
            return login_success_log(user, host, state.current_time)

    failed_login(state, user.id)
    return login_failure_log(user, host, state.current_time)


def generate_server_event(state: SimulationState):
    user = choose_logged_in_user(state)

    if user is None:
        return None

    host = state.hosts[user.current_host]
    event = random.random()

    if event < 0.6:
        processes = ["bash", "python", "vim", "ssh", "chrome"]
        process = random.choice(processes)

        execute_process(state, user.id, host.id, process)

        return process_execution_log(
            user,
            host,
            state.current_time,
            process
        )

    filename = random.choice(host.files)

    access_file(state, user.id, host.id, filename)

    return file_access_log(
        user,
        host,
        state.current_time,
        filename
    )


def generate_web_event(state: SimulationState):
    user = choose_logged_in_user(state)

    if user is None:
        return None

    host = state.hosts[user.current_host]

    event = random.random()

    if event < 0.75:
        path = random.choice([
            "/",
            "/login",
            "/dashboard",
            "/profile",
            "/api/users"
        ])

        return http_request_log(
            user,
            host,
            state.current_time,
            path
        )

    if event < 0.9:
        path = random.choice([
            "/admin",
            "/api/admin",
            "/private",
            "/config"
        ])

        return http_error_log(
            host,
            state.current_time,
            random.choice([401, 403, 500]),
            path
        )

    return suspicious_request_log(
        user,
        host,
        state.current_time,
        random.choice([
            "/../../etc/passwd",
            "/admin?cmd=whoami",
            "/api/debug"
        ])
    )


def generate_network_event(state: SimulationState):
    host = choose_host(state)

    destination_ip = random.choice([
        "10.0.0.1",
        "10.0.0.2",
        "10.0.0.3",
        "8.8.8.8",
        "1.1.1.1"
    ])

    port = random.choice([22, 53, 80, 443, 8080])

    event = random.random()

    network_connection(
        state,
        host.ip_address,
        destination_ip,
        port
    )

    if event < 0.8:
        return allowed_connection_log(
            state.current_time,
            host.ip_address,
            destination_ip,
            port,
            "TCP"
        )

    if event < 0.95:
        return blocked_connection_log(
            state.current_time,
            host.ip_address,
            destination_ip,
            port,
            "TCP"
        )

    return suspicious_network_log(
        state.current_time,
        host.ip_address,
        destination_ip,
        port,
        "Unusual network activity"
    )


def generate_event(state: SimulationState):
    event_type = random.choices(
        ["auth", "server", "web", "network"],
        weights=[15, 20, 40, 25],
        k=1
    )[0]

    if event_type == "auth":
        return generate_auth_event(state)

    if event_type == "server":
        return generate_server_event(state)

    if event_type == "web":
        return generate_web_event(state)

    return generate_network_event(state)


def parse_args():
    parser = argparse.ArgumentParser()

    parser.add_argument("--users", type=int, default=20)
    parser.add_argument("--hosts", type=int, default=5)
    parser.add_argument("--rate", type=float, default=1.0) #average per second
    parser.add_argument("--runtime", type=int, default=0)
    parser.add_argument("--speed", type=float, default=1.0)
    parser.add_argument("--attack-probability", type=float, default=0.05)

    return parser.parse_args()


def main():
    args = parse_args()

    state = create_initial_state(args.users, args.hosts)

    start_time = time.time()

    while args.runtime == 0 or time.time() - start_time < args.runtime:
        delay = random.expovariate(args.rate)
        state.current_time += timedelta(seconds=delay)

        if random.random() < args.attack_probability:
            user, host = choose_attack_target(state)

            if user is not None:
                events = brute_force_attack(state, user, host)
            else:
                events = []

            for event in events:
                print_event(event)
                publish_event(event)
                state.current_time += timedelta(seconds=random.uniform(0.05, 0.5))

        else:
            event = generate_event(state)

            if event is not None:
                print_event(event)
                publish_event(event)

        time.sleep(delay / args.speed)

if __name__ == "__main__":
    main()