// client-ui/src/App.js
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Activity, AlertTriangle, Terminal } from 'lucide-react';
import './App.css';

const SOCKET_URL = 'https://sunbalazizlcwu-omni-node-broker.hf.space';

export default function App() {
    const [telemetry, setTelemetry] = useState([]);
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        // Force the connection to use strictly WebSockets to bypass Codespace polling blocks
        const socket = io(SOCKET_URL, {
            transports: ['websocket'],
            secure: true,
            rejectUnauthorized: false
        });

        socket.on('connect', () => console.log('Connected to Omni-Node Mesh!'));
        socket.on('connect_error', (err) => console.error('Connection Failed:', err.message));

        socket.on('telemetry_update', (data) => {
            setTelemetry(prev => [data, ...prev].slice(0, 8)); 
        });

        socket.on('remediation_plan', (data) => {
            setAlerts(prev => [data, ...prev].slice(0, 4));
        });

        return () => socket.disconnect();
    }, []);

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ color: '#ffffff', borderBottom: '1px solid #1e2128', paddingBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Activity color="#00a8ff" /> Omni-Node Operations Mesh
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '30px' }}>
                {/* Live Telemetry Feed */}
                <div style={{ background: '#12151a', border: '1px solid #1e2128', borderRadius: '8px', padding: '20px' }}>
                    <h3 style={{ color: '#94a3b8', marginTop: 0 }}>Live Cluster Telemetry</h3>
                    {telemetry.map((t, i) => (
                        <div key={i} style={{ 
                            padding: '12px', 
                            marginBottom: '10px', 
                            background: '#1a1d24',
                            borderLeft: t.cpu_load > 90 ? '3px solid #ffb300' : '3px solid #00a8ff',
                            fontFamily: 'monospace', fontSize: '14px'
                        }}>
                            <strong>{t.component_id}</strong> | CPU: {t.cpu_load.toFixed(1)}% | RAM: {t.memory_usage.toFixed(1)}GB | Ping: {t.api_latency.toFixed(0)}ms
                        </div>
                    ))}
                </div>

                {/* AI Agent Remediation Feed */}
                <div style={{ background: '#12151a', border: '1px solid #1e2128', borderRadius: '8px', padding: '20px' }}>
                    <h3 style={{ color: '#94a3b8', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Terminal size={18} /> Autonomous Agent Logs
                    </h3>
                    {alerts.length === 0 ? <p style={{ color: '#475569' }}>Awaiting anomalies...</p> : alerts.map((a, i) => (
                        <div key={i} style={{ padding: '15px', marginBottom: '15px', background: '#1e1b14', border: '1px solid #ffb300', borderRadius: '4px' }}>
                            <div style={{ color: '#ffb300', fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <AlertTriangle size={16} /> Resolution for {a.component}
                            </div>
                            <div style={{ color: '#cbd5e1', fontSize: '13px', marginBottom: '10px' }}>
                                <strong>Diagnosis:</strong> {a.plan.root_cause_diagnosis}
                            </div>
                            <div style={{ background: '#0d0f12', padding: '10px', color: '#00a8ff', fontFamily: 'monospace', fontSize: '12px' }}>
                                {a.plan.bash_mitigation_command}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}