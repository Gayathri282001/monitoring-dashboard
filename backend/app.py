from flask import Flask, jsonify
import random
import time
import threading

app = Flask(__name__)

# Monotonic counter (thread-safe increment)
counter = {"value": 0}
counter_lock = threading.Lock()

def increment_counter():
    while True:
        with counter_lock:
            counter["value"] += 1
        time.sleep(5)  # increases every 5 seconds

threading.Thread(target=increment_counter, daemon=True).start()

@app.route("/metrics")
def metrics():
    # Simulated metrics
    cpu = round(random.uniform(5, 95), 2)           # CPU percentage
    latency_ms = round(random.uniform(20, 1200), 2) # latency in ms
    errors = random.randint(0, 5)                   # recent error count

    with counter_lock:
        monotonic = counter["value"]

    payload = {
        "timestamp": int(time.time()),
        "metrics": {
            "cpu_percent": cpu,
            "latency_ms": latency_ms,
            "error_count": errors,
            "monotonic_counter": monotonic
        }
    }
    return jsonify(payload)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
