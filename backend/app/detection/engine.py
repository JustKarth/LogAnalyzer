import logging
from typing import List

from app.rules.models import Detection
from app.rules.base import DetectionContext, DetectionRule

logger = logging.getLogger(__name__)


class DetectionEngine:
    """
    Evaluates incoming normalized log events against registered rules.
    """

    def __init__(self, context: DetectionContext):
        self.context = context
        self.rules: List[DetectionRule] = []

    def register_rule(self, rule: DetectionRule) -> None:
        """
        Register a new detection rule instance into the engine execution pipeline.
        """
        self.rules.append(rule)
        logger.info(f"Registered detection rule: {rule.name} ({rule.rule_id})")

    def process_event(self, event: dict) -> List[Detection]:
        """
        Runs an incoming normalized event through all registered detection rules.
        
        Returns a list of generated Detection objects (empty list if no rules trigger).
        """
        detections: List[Detection] = []

        for rule in self.rules:
            try:
                detection = rule.evaluate(event, self.context)
                if detection:
                    detections.append(detection)
            except Exception as e:
                # Log the error safely so one faulty rule doesn't break the entire engine loop
                logger.error(
                    f"Error evaluating rule '{rule.rule_id}' on event '{event.get('event_id')}': {e}",
                    exc_info=True,
                )

        return detections