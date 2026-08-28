# Log Generator

The generator creates synthetic authentication, server, web application, and
network security events. It writes one JSON object per line to standard output,
so the output can be redirected to Redis.

## Running the generator

Run the simulator from the `generator/` directory:

```text
python simulator.py
```

The default configuration runs continuously. Use `--runtime` for a finite run:

```text
python simulator.py --users 20 --hosts 5 --rate 2 --runtime 60 > sample.jsonl
```

The generator uses only the Python standard library. Because the source uses
local-module imports, run the command from the `generator/` directory unless
that directory has been added to `PYTHONPATH`.

## Command-line options

| Option | Default | Description |
| --- | ---: | --- |
| `--users` | `20` | Number of simulated users. |
| `--hosts` | `5` | Number of simulated hosts. |
| `--rate` | `1.0` | Average events per second. The delay is sampled exponentially. |
| `--runtime` | `0` | Runtime in seconds. `0` runs until interrupted. |
| `--speed` | `1.0` | Accepted by the CLI, but currently unused by the simulator. |
| `--attack-probability` | `0.05` | Probability that an iteration starts the brute-force attack path. Use a value from `0` to `1`. |

For example:

```text
python simulator.py --users 10 --hosts 3 --rate 5 --runtime 30 --attack-probability 0.1
```

Press `Ctrl+C` to stop an unlimited run. The simulator advances timestamps in
simulated time and does not sleep between normal events.

## Initial state

The simulator creates the following state:

- Users named `user001`, `user002`, and so on, with IDs such as `user_001`.
- The first user has `ADMIN` privileges; all other users have `USER` privileges.
- Hosts named `host-001`, `host-002`, and so on, with IDs such as `host_001`.
- Host IP addresses beginning at `10.0.0.1`.
- Each host runs `ssh` and `http` and contains `/home/user/document.txt` and `/var/log/system.log`.

The in-memory state tracks users, hosts, sessions, active network connections,
login failures, running processes, and the current UTC timestamp.

## Event generation

Normal iterations select an event family using these weights:

| Event family | Weight | Event types |
| --- | ---: | --- |
| Authentication | 15% | `LOGIN_SUCCESS`, `LOGIN_FAILURE`, `LOGOUT` |
| Server | 20% | `PROCESS_EXECUTION`, `FILE_ACCESS` |
| Web application | 40% | `HTTP_REQUEST`, `HTTP_401`, `HTTP_403`, `HTTP_500`, `SUSPICIOUS_REQUEST` |
| Network | 25% | `CONNECTION_ALLOWED`, `CONNECTION_BLOCKED`, `SUSPICIOUS_NETWORK_ACTIVITY` |

Server and web events require a logged-in user. If no user is logged in, that
iteration produces no event. Network events can be produced without a logged-in
user.

## Attack scenario

When an iteration is selected by `--attack-probability`, the simulator chooses
a random user and host and emits a brute-force sequence:

1. Five `LOGIN_FAILURE` events.
2. One `LOGIN_SUCCESS` event.
3. One `PROCESS_EXECUTION` event for a random `bash`, `python`, or `ssh` process.

Attack events are emitted as a burst. Their timestamps begin at the current
simulated time, with random gaps between 0.05 and 0.5 seconds.

## JSON output

Every event contains a `timestamp` in ISO 8601 format and an `event_type`.
Events have these additional fields:

| Event type | Additional fields |
| --- | --- |
| `LOGIN_SUCCESS`, `LOGIN_FAILURE` | `user`, `host`, `src_ip` |
| `LOGOUT` | `user`, `host` |
| `PROCESS_EXECUTION` | `user`, `host`, `process` |
| `FILE_ACCESS` | `user`, `host`, `file` |
| `HTTP_REQUEST` | `user`, `host`, `src_ip`, `method`, `path` |
| `HTTP_401`, `HTTP_403`, `HTTP_500` | `host`, `path`, `status_code` |
| `SUSPICIOUS_REQUEST` | `user`, `host`, `src_ip`, `path` |
| `CONNECTION_ALLOWED`, `CONNECTION_BLOCKED` | `src_ip`, `dst_ip`, `dst_port`, `protocol` |
| `SUSPICIOUS_NETWORK_ACTIVITY` | `src_ip`, `dst_ip`, `dst_port`, `reason` |

Example:

```json
{"timestamp": "2026-08-27T12:00:00+00:00", "event_type": "HTTP_REQUEST", "user": "user002", "host": "host-001", "src_ip": "10.0.0.1", "method": "GET", "path": "/dashboard"}
```

Normal web paths include `/`, `/login`, `/dashboard`, `/profile`, and
`/api/users`. Error paths include `/admin`, `/api/admin`, `/private`, and
`/config`. Suspicious paths include `/../../etc/passwd`,
`/admin?cmd=whoami`, and `/api/debug`.

Network events use TCP and select destinations from internal addresses plus
`8.8.8.8` and `1.1.1.1`. Possible destination ports are `22`, `53`, `80`,
`443`, and `8080`.

## Module reference

- `simulator.py`: CLI parsing, initial-state creation, event selection, and the main loop.
- `state.py`: Dataclasses for users, hosts, sessions, network connections, and simulation state.
- `actions.py`: State changes such as login, logout, failed login, process execution, file access, and network connections.
- `scenarios.py`: Random attack-target selection and the brute-force attack sequence.
- `authenticationLogs.py`: Authentication event dictionaries.
- `serverLogs.py`: Process and file-access event dictionaries.
- `webAppLogs.py`: HTTP request, HTTP error, and suspicious request dictionaries.
- `networkLogs.py`: Allowed, blocked, and suspicious network event dictionaries.
- `output.py`: `print_event()` writes flushed JSONL to stdout; `write_event()` writes flushed JSONL to an open file.

## Current implementation notes

`scenario_manager.py` is not used by `simulator.py`. It currently imports
`NormalUserScenario` and `BruteForceScenario`, which are not defined in
`scenarios.py`, so it is not a working entry point.

There is no `publisher.py` in the current directory, It will be added during integration.

