import os
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
import redis

from app.db.connection import SessionLocal, get_db
from app.db.models import Detection
from app.detection.engine import DetectionEngine
from app.detection.context import RedisDetectionContext
from app.services.detection_service import process_unprocessed_events

# --- Rule imports ---
from app.rules.brute_force import BruteForceRule
from app.rules.port_scan import PortScanRule
from app.rules.privilege_escalation import PrivilegeEscalationRule
from app.rules.data_exfiltration import PossibleDataExfiltrationRule
from app.rules.sensitive_resource_access import SensitiveResourceAccessRule

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Redis client connection
redis_host = os.getenv("REDIS_HOST", "redis")
redis_port = int(os.getenv("REDIS_PORT", 6379))
redis_client = redis.Redis(host=redis_host, port=redis_port, db=0)

# Initialize Detection Engine with concrete Redis Context
context = RedisDetectionContext(redis_client=redis_client)
engine = DetectionEngine(context=context)

# --- Register rules ---
engine.register_rule(BruteForceRule())
engine.register_rule(PortScanRule())
engine.register_rule(PrivilegeEscalationRule())
engine.register_rule(PossibleDataExfiltrationRule())
engine.register_rule(SensitiveResourceAccessRule())


def run_batch():
    """Synchronous helper function to run database batch processing."""
    with SessionLocal() as db:
        return process_unprocessed_events(db, engine)


async def detection_worker():
    """Background polling loop executing DB tasks in a background thread."""
    logger.info("Starting Detection Engine worker loop...")
    while True:
        try:
            processed_count = await asyncio.to_thread(run_batch)
            await asyncio.sleep(0.5 if processed_count > 0 else 3.0)
        except asyncio.CancelledError:
            logger.info("Detection Engine worker task cancelled.")
            break
        except Exception as e:
            logger.error(f"Error in detection worker loop: {e}", exc_info=True)
            await asyncio.sleep(5.0)


@asynccontextmanager
async def lifespan(app: FastAPI):
    worker_task = asyncio.create_task(detection_worker())
    yield
    worker_task.cancel()
    try:
        await worker_task
    except asyncio.CancelledError:
        pass


app = FastAPI(title="SIEM Core Engine API", lifespan=lifespan)


@app.get("/api/v1/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/v1/detections")
def get_detections(limit: int = 50, db: Session = Depends(get_db)):
    """Fetch recent triggered security alerts."""
    return db.query(Detection).order_by(Detection.detected_at.desc()).limit(limit).all()