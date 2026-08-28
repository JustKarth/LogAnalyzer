from publisher import publish_event


event_id = publish_event(
    "2026-08-28T12:00:00+00:00 host-001 sshd[1234]: Failed password for user001 from 10.0.0.1"
)

print("Published:", event_id)