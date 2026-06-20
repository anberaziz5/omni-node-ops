require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');
const { GoogleGenAI } = require('@google/genai');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// --- 1. MONGODB LEDGER CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('[Database] MongoDB Audit Ledger Connected'))
    .catch(err => console.error('[Database] Connection Failed. Check your password and IP settings in Atlas:', err.message));

// --- 2. DEFINE THE DATA SCHEMA ---
const AuditLogSchema = new mongoose.Schema({
    component_id: String,
    cpu_load: Number,
    memory_usage: Number,
    api_latency: Number,
    ml_anomaly_score: Number,
    ai_diagnosis: String,
    ai_remediation_command: String,
    timestamp: { type: Date, default: Date.now }
});
const AuditLog = mongoose.model('AuditLog', AuditLogSchema);

// --- 3. PIPELINE SETUP ---
const PYTHON_URL = process.env.PYTHON_ENGINE_URL;
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function generateTelemetry() {
    const isSpike = Math.random() > 0.70; // 30% chance of anomaly
    return {
        component_id: `SRV-${Math.floor(Math.random() * 1000)}`,
        cpu_load: isSpike ? 98.5 : 45 + (Math.random() * 10),
        memory_usage: isSpike ? 62.0 : 16 + (Math.random() * 4),
        api_latency: isSpike ? 1500.0 : 120 + (Math.random() * 20)
    };
}

io.on('connection', (socket) => {
    console.log(`[Mesh Control] Dashboard connected: ${socket.id}`);

    const telemetryInterval = setInterval(async () => {
        const payload = generateTelemetry();
        console.log(`[Mesh Pulse] Emitting data for ${payload.component_id}`);
        socket.emit('telemetry_update', payload);

        try {
            const mlResponse = await axios.post(PYTHON_URL, payload);
            const { is_critical, anomaly_score } = mlResponse.data;

            if (is_critical) {
                socket.emit('alert_status', { component: payload.component_id, message: 'Anomaly Detected. Spawning Gemini Agent...' });
                
                // Trigger AI Engine
                const remediation = await triggerAutonomousAgent(payload, anomaly_score);
                
                // Stream Resolution to Frontend UI
                socket.emit('remediation_plan', { component: payload.component_id, plan: remediation });

                // --- 4. PERMANENTLY LOG TO MONGODB ---
                await AuditLog.create({
                    component_id: payload.component_id,
                    cpu_load: payload.cpu_load,
                    memory_usage: payload.memory_usage,
                    api_latency: payload.api_latency,
                    ml_anomaly_score: anomaly_score,
                    ai_diagnosis: remediation.root_cause_diagnosis,
                    ai_remediation_command: remediation.bash_mitigation_command
                });
                console.log(`[Ledger] Wrote AI Audit Log to MongoDB for ${payload.component_id}`);
            }
        } catch (error) {
            console.error('[Pipeline Error]', error.message);
        }
    }, 6000); 

    socket.on('disconnect', () => clearInterval(telemetryInterval));
});

async function triggerAutonomousAgent(telemetry, score) {
    const prompt = `CRITICAL ALERT on ${telemetry.component_id}. CPU: ${telemetry.cpu_load.toFixed(1)}%, RAM: ${telemetry.memory_usage.toFixed(1)}GB, Latency: ${telemetry.api_latency.toFixed(0)}ms. ML Anomaly Score: ${score}. Provide a concise JSON response with keys: "root_cause_diagnosis" and "bash_mitigation_command".`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are an elite Site Reliability Engineer. Output ONLY valid JSON.",
                responseMimeType: "application/json",
            }
        });

        return JSON.parse(response.text);
    } catch (err) {
        console.error('\n[Gemini API Error Details]:', err.message);
        return { 
            root_cause_diagnosis: `Agent Execution Failure: ${err.message}`, 
            bash_mitigation_command: "sudo systemctl restart networking" 
        };
    }
}

// --- 5. AUDIT LOG RETRIEVAL ENDPOINT ---
app.get('/api/logs', async (req, res) => {
    try {
        const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(50);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch ledger data' });
    }
});


const PORT = process.env.PORT || 7860;
server.listen(PORT, () => console.log(`[Broker] Orchestrator online on port ${PORT}`));