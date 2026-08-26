import random
import time
import argparse

from datetime import datetime, timezone
from state import SimulationState, User, Host
from actions import login, logout, failed_login
from authenticationLogs import (
    login_success_log,
    login_failure_log,
    logout_log
)


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
            files=["/home/user/document.txt", "/var/log/system.log"]
        )  
        state.add_host(host)


def create_initial_state(user_count: int, host_count: int):
    state = SimulationState()
    create_users(state, user_count)
    create_hosts(state, host_count)
    return state


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--users", type=int, default=20)
    parser.add_argument("--hosts", type=int, default=5)
    parser.add_argument("--rate", type=float, default=1.0)
    return parser.parse_args()


def simulate_auth_event(state: SimulationState):
    user = random.choice(list(state.users.values()))
    host = random.choice(list(state.hosts.values()))
    event = random.random()

    if event < 0.6:
        if not user.logged_in:
            session = login(state, user.id, host.id)
            if session:
                log = login_success_log(
                    user,
                    host,
                    state.current_time
                )
                print(log)
    elif event < 0.85:
        failed_login(state, user.id)
        log = login_failure_log(
            user,
            host,
            state.current_time
        )
        print(log)
    else:
        if user.logged_in:
            host = state.hosts[user.current_host]
            logout(state, user.id)
            log = logout_log(
                user,
                host,
                state.current_time
            )
            print(log)

def main():
    args = parse_args()

    state = create_initial_state(args.users, args.hosts)

    while True:
        state.current_time = datetime.now(timezone.utc)
        simulate_auth_event(state)
        time.sleep(1 / args.rate)

if __name__ == "__main__":
    main()