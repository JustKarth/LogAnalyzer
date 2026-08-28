# LogAnalyzer

## Complete pipeline

The project pipeline is:

**Generator -> Redis Stream -> Processor -> PostgreSQL**

The Generator creates synthetic authentication, server, web/application, and
network logs and publishes each raw line to the Redis Stream named `logs`.
Redis is the transport layer. The Processor reads those raw entries, parses
and normalizes them, and PostgreSQL persistently stores the resulting rows in
the `events` table.

## Start and verify

On a fresh checkout with the Compose database variables configured, build and
start the stack from the repository root:

```powershell
docker compose up -d --build
docker compose ps
```

Inspect processor activity:

```powershell
docker compose logs -f processor
```

Check stored events using the PostgreSQL credentials and database name from
the Compose environment:

```powershell
docker compose exec postgres psql -U <POSTGRES_USER> -d <POSTGRES_DB> -c "SELECT event_id, event_type, timestamp, source_id FROM events ORDER BY timestamp DESC LIMIT 20;"
```

The processor currently uses `source_001` for inserted events, so that source
must be present in `log_sources` for the foreign-key insert to succeed.
