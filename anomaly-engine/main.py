# anomaly-engine/main.py
from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
from sklearn.ensemble import IsolationForest
import uvicorn

app = FastAPI(title="Omni-Node ML Engine")

# Train a baseline Isolation Forest for unsupervised anomaly detection
# Simulating baseline normal metrics: [CPU Load (%), Memory (GB), Latency (ms)]
baseline_data = np.random.normal(loc=[45.0, 16.0, 120.0], scale=[5.0, 2.0, 15.0], size=(1000, 3))
clf = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
clf.fit(baseline_data)

class TelemetryPayload(BaseModel):
    component_id: str
    cpu_load: float
    memory_usage: float
    api_latency: float

@app.post("/api/v1/analyze")
async def analyze_telemetry(data: TelemetryPayload):
    # Format incoming telemetry into a 2D array
    current_state = np.array([[data.cpu_load, data.memory_usage, data.api_latency]])
    
    # Predict: 1 for normal, -1 for anomaly
    prediction = clf.predict(current_state)[0]
    score = clf.decision_function(current_state)[0]
    
    is_critical = bool(prediction == -1)
    
    return {
        "component_id": data.component_id,
        "is_critical": is_critical,
        "anomaly_score": round(float(score), 4),
        "status": "REQUIRES_REMEDIATION" if is_critical else "NOMINAL"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)