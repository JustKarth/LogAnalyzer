# app/detection/models.py

from datetime import datetime
from enum import StrEnum
from typing import Any

from pydantic import BaseModel, Field


class DetectionSeverity(StrEnum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class Detection(BaseModel):
    """
    Represents a security detection produced by the Detection Engine.
    """

    detection_id: str
    rule_id: str
    detection_type: str

    timestamp: datetime

    severity: DetectionSeverity
    confidence: float = Field(ge=0.0, le=1.0)

    event_ids: list[str] = Field(default_factory=list)

    description: str

    metadata: dict[str, Any] = Field(default_factory=dict)