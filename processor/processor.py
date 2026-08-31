import json
import os

import redis
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from parser.authParser import parse_auth_log
from parser.serverParser import parse_server_log
from parser.webAppParser import parse_web_app_log
from parser.networkParser import parse_network_log

from normalizer import normalize_event


load_dotenv()


PARSERS = {
    "AUTH": parse_auth_log,
    "SERVER": parse_server_log,
    "WEB": parse_web_app_log,
    "NETWORK": parse_network_log
}


REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_STREAM = os.getenv("REDIS_STREAM", "logs")

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set")


redis_client = redis.Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    decode_responses=True
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False
)


def process_log(
    raw_log: str,
    source_id: str,
    source_type: str
) -> dict:

    parser = PARSERS.get(source_type)

    if parser is None:
        raise ValueError(
            f"Unsupported source type: {source_type}"
        )

    parsed_event = parser(raw_log)

    if parsed_event is None:
        raise ValueError(
            f"Unrecognized {source_type} log: {raw_log}"
        )

    return normalize_event(
        parsed_event,
        source_id,
        source_type,
        raw_log
    )


def insert_event(db, event: dict):
    query = """
        INSERT INTO events (
            event_id,
            source_id,
            timestamp,
            event_type,
            severity,
            user_name,
            src_ip,
            dst_ip,
            host,
            message,
            metadata
        )
        VALUES (
            CAST(:event_id AS UUID),
            :source_id,
            :timestamp,
            :event_type,
            :severity,
            :user_name,
            :src_ip,
            :dst_ip,
            :host,
            :message,
            :metadata
        )
    """

    from sqlalchemy import text

    db.execute(
        text(query),
        {
            "event_id": event["event_id"],
            "source_id": event.get("source_id"),
            "timestamp": event["timestamp"],
            "event_type": event["event_type"],
            "severity": event.get("severity"),
            "user_name": event.get("user"),
            "src_ip": event.get("src_ip"),
            "dst_ip": event.get("dst_ip"),
            "host": event.get("host"),
            "message": event.get("message"),
            "metadata": json.dumps(event.get("metadata", {}))
        }
    )

    db.commit()


def detect_source_type(raw_log: str) -> str:
    if "sshd[" in raw_log or "sudo:" in raw_log:
        return "AUTH"

    if "process:" in raw_log or "file:" in raw_log:
        return "SERVER"

    if " web:" in raw_log:
        return "WEB"

    if "firewall:" in raw_log:
        return "NETWORK"

    raise ValueError(
        f"Unable to determine source type: {raw_log}"
    )


def main():
    last_id = "0-0"

    print("Processor started", flush=True)

    while True:
        messages = redis_client.xread(
            {REDIS_STREAM: last_id},
            count=10,
            block=5000
        )

        if not messages:
            continue

        for _, entries in messages:
            for message_id, data in entries:
                try:
                    raw_log = data["raw_log"]

                    source_type = detect_source_type(raw_log)

                    event = process_log(
                        raw_log,
                        "source_001",
                        source_type
                    )

                    with SessionLocal() as db:
                        insert_event(db, event)

                    last_id = message_id

                    print(
                        f"Processed {message_id} -> "
                        f"{event['event_type']}",
                        flush=True
                    )

                except Exception as e:
                    print(
                        f"Failed {message_id}: {e}",
                        flush=True
                    )


if __name__ == "__main__":
    main()