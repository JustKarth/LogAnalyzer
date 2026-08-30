import sys
from pathlib import Path

# Add the 'backend' folder to Python's module lookup paths
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.detection.engine import DetectionEngine
from app.detection.in_memory_context import InMemoryDetectionContext
from app.rules.brute_force import BruteForceRule
from app.rules.port_scan import PortScanRule

# 1. Instantiate the mock in-memory context (No Redis needed!)
context = InMemoryDetectionContext()

# 2. Instantiate the Engine with the mock context
engine = DetectionEngine(context=context)

# 3. Register rules with low thresholds for easy testing
engine.register_rule(BruteForceRule(failure_threshold=3, window_seconds=60))
engine.register_rule(PortScanRule(port_threshold=3, window_seconds=60))

# 4. Run Test: Simulate Brute Force Attacks
print("=== TEST 1: Brute Force Detection ===")
ip_address = "192.168.1.100"

for attempt in range(1, 4):
    mock_event = {
        "event_id": f"evt_bf_{attempt}",
        "event_type": "AUTH_FAILURE",
        "user": "root",
        "src_ip": ip_address,
        "host": "auth-server",
    }
    
    detections = engine.process_event(mock_event)
    print(f"Attempt {attempt}: {len(detections)} detection(s) triggered.")
    
    for det in detections:
        print(f"  --> [ALERT] Rule: {det.rule_id} | Severity: {det.severity} | {det.description}")

# 5. Run Test: Simulate Port Scanning
print("\n=== TEST 2: Port Scan Detection ===")
scan_ip = "10.0.0.45"
target_ports = [22, 80, 443]

for idx, port in enumerate(target_ports, start=1):
    mock_event = {
        "event_id": f"evt_ps_{idx}",
        "event_type": "PORT_ACCESS",
        "src_ip": scan_ip,
        "host": "target-server",
        "metadata": {"dst_port": port},
    }
    
    detections = engine.process_event(mock_event)
    print(f"Port {port} probe: {len(detections)} detection(s) triggered.")
    
    for det in detections:
        print(f"  --> [ALERT] Rule: {det.rule_id} | Severity: {det.severity} | {det.description}")