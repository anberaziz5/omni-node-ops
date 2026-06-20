# Omni-Node // Autonomous Operational Mesh & Infrastructure Ledger

<div align="center">

![Contributors](https://img.shields.io/github/contributors/username/omni-node?style=for-the-badge&color=00FF66)
![Stars](https://img.shields.io/github/stars/username/omni-node?style=for-the-badge&color=00FF66)
![License](https://img.shields.io/github/license/username/omni-node?style=for-the-badge&color=111111)
![Node Version](https://img.shields.io/badge/Node.js-v20+-green?style=for-the-badge&logo=node.js)
![Python Version](https://img.shields.io/badge/Python-3.10+-blue?style=for-the-badge&logo=python)
![Database](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)
![AI Engine](https://img.shields.io/badge/Gemini-2.5--Flash-orange?style=for-the-badge&logo=google-gemini)

<p align="center">
  <strong>A distributed, low-latency infrastructure monitoring and autonomous self-healing operational mesh.</strong>
  <br />
  Eliminating human MTTR (Mean Time To Resolution) by combining real-time WebSocket pipelines, unsupervised Machine Learning anomaly detection, and generative AI execution agents.
</p>

</div>

---

## ─── System Architecture Overview ───

Omni-Node decouples system monitoring from manual human intervention. The architecture operates as a low-latency cyclic control loop distributed across four distinct infrastructure layers:


```

┌────────────────────────────────────────────────────────┐
│                   React Dashboard                      │
│     (Real-Time WebSockets UI / State Visualization)    │
└─────────────────────────▲──────────────────────────────┘
│ (Bidirectional Streams)
┌─────────────────────────▼──────────────────────────────┐
│            Node.js Control Plane & Broker               │
│      (Event Orchestrator / State Machine / Server)     │
└───────┬──────────────────▲──────────────────────┬──────┘
│                  │                      │
│ (POST Payload)   │ (Outlier Flags)      │ (Persist Receipts)
┌───────▼──────────────────┴─────────────┐  ┌─────▼─────────────────────┐
│    Python ML Detection Engine          │  │    MongoDB Atlas Cloud     │
│ (FastAPI / Isolation Forest Model)     │  │   (Immutable Audit Logs)   │
└────────────────────────────────────────┘  └───────────────────────────┘
│
│ (Contextual Prompt Injection)
┌───────▼────────────────────────────────┐
│      Google Gemini 2.5 Flash API        │
│ (Autonomous SRE Reasoning & Scripting) │
└────────────────────────────────────────┘

```

1. **The Telemetry Pipeline (Node.js & WebSockets):** Ingests and streams cluster-wide health data (CPU, RAM, API Latency) at regular frequencies, routing active telemetry packet payloads dynamically to downstream microservices.
2. **The Intelligence Layer (Python & Scikit-Learn):** An unsupervised **Isolation Forest** machine learning model evaluates structural multivariate trends. Outliers are instantly mathematical flagged as critical anomalies ($1$) without relying on static hard-coded thresholds.
3. **The Remediation Layer (Gemini 2.5 Flash SDK):** When a critical alert is triggered, an LLM-driven reasoning agent evaluates the system state vector, diagnoses root causes, and compiles programmatically formatted executable JSON mitigation scripts.
4. **The Audit Ledger (MongoDB Cloud):** Every automated intervention, diagnostic reasoning chain, and generated system command is safely recorded into a persistent cloud collection for post-mortem analysis.

---

## ─── Key Engineering Capabilities ───

* ⚡ **Sub-Second Automated Remediation:** Replaces manual 15-minute SRE triage cycles with a 2-second automated detect-and-solve background sequence.
* 🌲 **Unsupervised Outlier Detection:** Utilizes multi-dimensional spatial partitions via Isolation Forests to locate operational abnormalities before cascading system failure occurs.
* 🤖 **Native Deterministic AI Guardrails:** Forces structured schema compliance on generative AI outputs using native `responseMimeType: "application/json"` formats to ensure safe parsing within infrastructure runtimes.
* 📜 **Immutable Ledger Auditing:** Fully persistent event tracking using Mongoose object modeling to verify AI behavior for regulatory compliance.

---

## ─── Core Tech Stack ───

* **Control Plane / Backend:** Node.js, Express, Socket.io, Axios, Mongoose
* **Machine Learning Engine:** Python 3.10+, FastAPI, Scikit-Learn, NumPy, Uvicorn
* **Reasoning Foundation:** Google GenAI SDK (`@google/genai`), Gemini 2.5 Flash
* **Persistence Layer:** MongoDB Atlas Cloud Architecture

---

## ─── Environment Configuration ───

The architecture relies on separate configuration environments across services to maintain separation of concerns.

### 1. Mesh Broker Environment (`mesh-broker/.env`)
```env
PORT=8080
GEMINI_API_KEY=AIzaSyYourValidatedGeminiKeyHere
PYTHON_ENGINE_URL=http://localhost:8000/api/v1/analyze
MONGO_URI=mongodb+srv://admin:<password>@cluster0.mongodb.net/omni-node?retryWrites=true&w=majority

```

### 2. Anomaly Engine Environment (`anomaly-engine/.env`)

```env
HOST=127.0.0.1
PORT=8000

```

---

## ─── Installation & Local Deployment ───

To deploy the entire telemetry mesh locally, execute the following commands within isolated terminal windows.

### Phase 1: Spin up the Python ML Microservice

```bash
cd anomaly-engine
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000 --reload

```

### Phase 2: Start the Node.js Event Broker

```bash
cd mesh-broker
npm install
node server.js

```

### Phase 3: Launch the Monitoring Frontend Dashboard

```bash
cd telemetry-ui
npm install
npm run dev

```

---

## ─── Production Data Schemas ───

Data structures enforced across the MongoDB ledger collection to guarantee historical persistence tracking:

```json
{
  "_id": "6674f1e5c3e1b6a4f912cd3a",
  "component_id": "SRV-894",
  "cpu_load": 98.5,
  "memory_usage": 62.0,
  "api_latency": 1500.0,
  "ml_anomaly_score": -0.1425,
  "ai_diagnosis": "Runaway process or thread pool starvation causing core CPU exhaustion.",
  "ai_remediation_command": "sudo kill -15 $(ps aux --sort=-%cpu | awk 'NR==2 {print $2}')",
  "timestamp": "2026-06-20T16:40:05.123Z"
}

```

---

## ─── REST API Reference ───

### Get Historical Audit Ledger

Fetches the 50 most recent autonomous self-healing interventions written by the AI engine.

* **Endpoint:** `/api/logs`
* **Method:** `GET`
* **Success Response (200 OK):**

```json
[
  {
    "component_id": "SRV-231",
    "cpu_load": 98.5,
    "ai_diagnosis": "System critically overloaded with 98.5% CPU utilization and severe latency (1500ms).",
    "ai_remediation_command": "sudo systemctl restart networking",
    "timestamp": "2026-06-20T16:42:10.000Z"
  }
]

```

---

## ─── Future Expansion Roadmap ───

* **Active SSH Runtime Execution:** Interface the system with secure shell parameters to execute generated bash commands inside decoupled target containers autonomously.
* **Proactive Vector Scaling:** Switch from basic synthetic telemetry loops to actual Prometheus data pollers pulling production-grade enterprise node pools.
* **Human-in-the-Loop Webhooks:** Integrate Twilio or Slack APIs requesting human developer authorization before executing destructive commands (like `rm` or server reboots).

---

## ─── License ───

Distributed under the MIT License. See `LICENSE` for more information.
