# app/detection/rules/base.py

from abc import ABC, abstractmethod
from typing import Any

from app.detection.models import Detection


class DetectionContext(ABC):
    """
    Interface through which detection rules access
    temporary state and detection-related information.
    """

    @abstractmethod
    def get_state(self, key: str) -> Any:
        raise NotImplementedError

    @abstractmethod
    def set_state(
        self,
        key: str,
        value: Any,
        *,
        ttl: int | None = None,
    ) -> None:
        raise NotImplementedError


class DetectionRule(ABC):
    """
    Base interface for all rule-based detection logic.
    """

    rule_id: str
    name: str
    description: str

    @abstractmethod
    def evaluate(
        self,
        event,
        context: DetectionContext,
    ) -> Detection | None:
        """
        Evaluate an event against the rule.

        Returns a Detection when the rule triggers,
        otherwise None.
        """
        raise NotImplementedError