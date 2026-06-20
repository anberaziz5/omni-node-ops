// mesh-broker/server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PYTHON_URL = process.env.PYTHON_ENGINE_URL;
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

// Simulate incoming enterprise server telemetry
function generateTelemetry() {
    // 10% chance to simulate a massive server spike
    const isSpike = Math.random() > 0.90;
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
        socket.emit('telemetry_update', payload);

        try {
            // 1. Send data to Python ML Engine
            const mlResponse = await axios.post(PYTHON_URL, payload);
            const { is_critical, anomaly_score } = mlResponse.data;

            // 2. If critical, trigger AI Agent for remediation
            if (is_critical) {
                socket.emit('alert_status', { component: payload.component_id, message: 'Anomaly Detected. Spawning Agent...' });
                const remediation = await triggerAutonomousAgent(payload, anomaly_score);
                socket.emit('remediation_plan', { component: payload.component_id, plan: remediation });
            }
        } catch (error) {
            console.error('[Pipeline Error]', error.message);
        }
    }, 3000); // Poll every 3 seconds

    socket.on('disconnect', () => clearInterval(telemetryInterval));
});

async function triggerAutonomousAgent(telemetry, score) {
    const prompt = `CRITICAL ALERT on ${telemetry.component_id}. CPU: ${telemetry.cpu_load}%, RAM: ${telemetry.memory_usage}GB, Latency: ${telemetry.api_latency}ms. ML Anomaly Score: ${score}. Provide a concise JSON response with keys: "root_cause_diagnosis" and "bash_mitigation_command".`;

    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'meta-llama/llama-3-8b-instruct:free',
            messages: [
                { role: 'system', content: 'You are an elite Site Reliability Engineer. Output ONLY valid JSON.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' }
        }, {
            headers: { 'Authorization': `Bearer ${OPENROUTER_KEY}`, 'Content-Type': 'application/json' }
        });

        return JSON.parse(response.data.choices[0].message.content);
    } catch (err) {
        return { root_cause_diagnosis: "Agent timeout", bash_mitigation_command: "sudo systemctl restart networking" };
    }
}

server.listen(process.env.PORT || 8080, () => console.log('[Broker] Orchestrator online on port 8080'));