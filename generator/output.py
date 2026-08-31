import json
import sys


def print_event(event: str) -> None:
    print(event, flush=True)


def write_event(event: dict, file) -> None:
    file.write(json.dumps(event) + "\n")
    file.flush()