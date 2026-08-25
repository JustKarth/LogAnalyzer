from state import SimulationState, User, Host
import argparse

def create_users(state: SimulationState, count: int) -> None:
    for i in range(1, count + 1):
        user = User(
            id=f"user_{i:03d}",
            username=f"user{i:03d}",
            privilege="ADMIN" if i == 1 else "USER"
        )

        state.add_user(user)


def create_hosts(state: SimulationState, count: int) -> None:
    for i in range(1, count + 1):
        host = Host(
            id=f"host_{i:03d}",
            hostname=f"workstation-{i:03d}",
            ip_address=f"10.0.0.{i}",
            host_type="WORKSTATION"
        )

        state.add_host(host)


def create_initial_state(user_count: int, host_count: int) -> SimulationState:
    state = SimulationState()
    create_users(state, user_count)
    create_hosts(state, host_count)
    return state

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--users", type=int, default=10, help="Number of simulated users")
    parser.add_argument("--hosts", type=int, default=5, help="Number of simulated hosts")
    return parser.parse_args()


def main():
    args = parse_args()
    state = create_initial_state(user_count=args.users, host_count=args.hosts)

    print("Simulation started")
    print(f"Users: {len(state.users)}")
    print(f"Hosts: {len(state.hosts)}")

    for user in state.users.values():
        print(user)

    for host in state.hosts.values():
        print(host)


if __name__ == "__main__":
    main()