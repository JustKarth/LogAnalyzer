import random
from actions import failed_login, login, execute_process
from authenticationLogs import login_success_log, login_failure_log
from serverLogs import process_execution_log


def choose_attack_target(state):
    user = random.choice(list(state.users.values()))
    host = random.choice(list(state.hosts.values()))
    return user, host


def brute_force_attack(state, user, host, attempts=5):
    events = []

    for _ in range(attempts):
        failed_login(state, user.id)
        events.append(
            login_failure_log(user, host, state.current_time)
        )

    session = login(state, user.id, host.id)

    events.append(
        login_success_log(user, host, state.current_time)
    )

    process = random.choice(["bash", "python", "ssh"])
    execute_process(state, user.id, host.id, process)

    events.append(
        process_execution_log(user, host, state.current_time, process)
    )

    return events