import random
from actions import failed_login, login, execute_process

def choose_attack_target(state):
    user = random.choice(list(state.users.values()))
    host = random.choice(list(state.hosts.values()))
    return user, host

def brute_force_attack(state, user, host, attempts=5):
    events = []

    for _ in range(attempts):
        failed_login(state, user.id)
        events.append({"event_type": "LOGIN_FAILURE", "user": user.username, "host": host.hostname, "src_ip": host.ip_address})

    session = login(state, user.id, host.id)

    events.append({"event_type": "LOGIN_SUCCESS", "user": user.username, "host": host.hostname, "src_ip": host.ip_address})

    process = random.choice(["bash", "python", "ssh"])
    execute_process(state, user.id, host.id, process)

    events.append({"event_type": "PROCESS_EXECUTION", "user": user.username, "host": host.hostname, "process": process})

    return events