require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(morgan('dev'));
app.use(express.json());
app.use(rateLimit({ windowMs: 60_000, max: 300 }));

// ─── In-Memory State ──────────────────────────────────────────────────────────
const state = {
  ownVessel: {
    id: 'MV-AURORA-001',
    name: 'MV AURORA',
    mmsi: '636019265',
    callsign: 'D5QG4',
    flag: 'LR',
    type: 'Bulk Carrier',
    lat: 4.3667,
    lon: 49.1833,
    heading: 47,
    speed: 12.4,
    course: 47,
    nextPort: 'MOMBASA',
    eta: new Date(Date.now() + 86400000 * 2).toISOString(),
    crew: 18
  },

  contacts: [
    {
      id: 'C-001', name: 'UNKNOWN-7', mmsi: null, type: 'unknown',
      lat: 4.42, lon: 49.28, heading: 227, speed: 28.3,
      threatLevel: 'high', category: 'PIRACY_SUSPECT',
      distance: 1.8, bearing: 67, lastSeen: Date.now(),
      track: [], notes: 'Fast craft, no AIS, intercept bearing'
    },
    {
      id: 'C-002', name: 'SUS-12', mmsi: null, type: 'unknown',
      lat: 4.28, lon: 49.07, heading: 110, speed: 11.2,
      threatLevel: 'medium', category: 'SUSPICIOUS',
      distance: 2.4, bearing: 220, lastSeen: Date.now(),
      track: [], notes: 'AIS intermittent, slow approach'
    },
    {
      id: 'C-003', name: 'M/T FALCON', mmsi: '205448890', type: 'tanker',
      lat: 4.31, lon: 49.25, heading: 185, speed: 9.8,
      threatLevel: 'low', category: 'VERIFIED',
      distance: 3.1, bearing: 42, lastSeen: Date.now(),
      track: [], notes: 'VDES verified'
    },
    {
      id: 'C-004', name: 'MSC GRACE', mmsi: '636092113', type: 'container',
      lat: 4.44, lon: 49.22, heading: 210, speed: 14.1,
      threatLevel: 'low', category: 'VERIFIED',
      distance: 3.7, bearing: 35, lastSeen: Date.now(),
      track: [], notes: 'Known container vessel'
    },
    {
      id: 'C-005', name: 'CMA CGM TITAN', mmsi: '477XXXXXX', type: 'container',
      lat: 4.25, lon: 49.24, heading: 55, speed: 16.4,
      threatLevel: 'low', category: 'VERIFIED',
      distance: 4.1, bearing: 135, lastSeen: Date.now(),
      track: [], notes: ''
    }
  ],

  sensors: {
    engineTemp: { value: 82, unit: '°C', status: 'ok', min: 60, max: 95 },
    bilgeWater: { value: 0.12, unit: 'm', status: 'ok', min: 0, max: 0.5 },
    mooringTension: { value: 78, unit: 'kN', status: 'warn', min: 0, max: 80 },
    fireDetection: { value: 'CLEAR', status: 'ok' },
    gasH2S: { value: 0.8, unit: 'ppm', status: 'ok', min: 0, max: 10 },
    gasCO: { value: 3.2, unit: 'ppm', status: 'ok', min: 0, max: 25 },
    crewBeacons: { total: 18, active: 18, overboard: 0, status: 'ok' },
    windSpeed: { value: 18, unit: 'kn', status: 'ok' },
    visibility: { value: 9.2, unit: 'NM', status: 'ok' },
    seaState: { value: 3, unit: 'Douglas', status: 'ok' }
  },

  alerts: [
    {
      id: uuidv4(), severity: 'high', time: Date.now() - 120000,
      category: 'THREAT', message: 'Unidentified fast craft (28 kn) on intercept bearing 067°',
      contactId: 'C-001', acknowledged: false
    },
    {
      id: uuidv4(), severity: 'warn', time: Date.now() - 360000,
      category: 'SENSOR', message: 'Mooring line #3 tension anomaly — 78 kN (limit 80 kN)',
      acknowledged: false
    },
    {
      id: uuidv4(), severity: 'info', time: Date.now() - 660000,
      category: 'AIS', message: 'AIS contact MSC GRACE verified via VDES authentication',
      acknowledged: true
    },
    {
      id: uuidv4(), severity: 'warn', time: Date.now() - 1020000,
      category: 'RADAR', message: 'Radar shadow zone detected — southern sector 170–210°',
      acknowledged: true
    },
    {
      id: uuidv4(), severity: 'info', time: Date.now() - 1320000,
      category: 'CCTV', message: 'CCTV AI analysis complete — no unauthorised deck access',
      acknowledged: true
    }
  ],

  riskAssessment: {
    overall: 6.4,
    piracy: 78,
    collision: 34,
    crewSafety: 12,
    weather: 22,
    mechanical: 18,
    recommendation: 'UNKNOWN-7 exhibits high-speed approach pattern consistent with Gulf of Aden piracy profiles. Evasive manoeuvre recommended. Notify UKMTO immediately.',
    lastUpdated: Date.now()
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) client.send(msg);
  });
}

function haversineNM(lat1, lon1, lat2, lon2) {
  const R = 3440.065; // nm
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
    * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Simulation Engine ────────────────────────────────────────────────────────
function simulate() {
  const t = Date.now();

  // Move own vessel
  const hRad = state.ownVessel.heading * Math.PI / 180;
  const spd = state.ownVessel.speed / 3600 / 60; // NM per second
  state.ownVessel.lat += spd * Math.cos(hRad) * (1 / 60);
  state.ownVessel.lon += spd * Math.sin(hRad) * (1 / 60);

  // Move contacts + add jitter
  state.contacts.forEach(c => {
    const hRad = c.heading * Math.PI / 180;
    const spd = c.speed / 3600 / 60;
    c.lat += spd * Math.cos(hRad) * (1 / 60) + (Math.random() - 0.5) * 0.0001;
    c.lon += spd * Math.sin(hRad) * (1 / 60) + (Math.random() - 0.5) * 0.0001;
    c.heading += (Math.random() - 0.5) * 0.5;
    c.lastSeen = t;
    c.distance = haversineNM(state.ownVessel.lat, state.ownVessel.lon, c.lat, c.lon);
    // Store track (last 20 positions)
    c.track.push({ lat: c.lat, lon: c.lon, t });
    if (c.track.length > 20) c.track.shift();
  });

  // Fluctuate sensors
  state.sensors.engineTemp.value = +(80 + Math.random() * 8).toFixed(1);
  state.sensors.engineTemp.status = state.sensors.engineTemp.value > 90 ? 'warn' : 'ok';
  state.sensors.gasH2S.value = +(Math.random() * 2).toFixed(2);
  state.sensors.windSpeed.value = +(15 + Math.random() * 10).toFixed(1);

  // Risk score fluctuation
  const threat = state.contacts.find(c => c.id === 'C-001');
  if (threat) {
    state.riskAssessment.piracy = Math.min(99, Math.max(50, state.riskAssessment.piracy + (Math.random() - 0.5) * 3));
    state.riskAssessment.overall = +(state.riskAssessment.piracy * 0.08 + 0.5).toFixed(1);
    state.riskAssessment.lastUpdated = t;
  }

  broadcast({ type: 'STATE_UPDATE', payload: getPublicState() });
}

setInterval(simulate, 2000);

// Random alert generator
setInterval(() => {
  const templates = [
    { severity: 'info', category: 'AIS', message: 'AIS transponder refresh — all contacts updated' },
    { severity: 'info', category: 'CCTV', message: 'CCTV sector sweep complete — port side clear' },
    { severity: 'warn', category: 'RADAR', message: 'Radar clutter detected — rain squall at 4 NM NE' }
  ];
  const tmpl = templates[Math.floor(Math.random() * templates.length)];
  const alert = { id: uuidv4(), ...tmpl, time: Date.now(), acknowledged: false };
  state.alerts.unshift(alert);
  if (state.alerts.length > 50) state.alerts.pop();
  broadcast({ type: 'NEW_ALERT', payload: alert });
}, 15000);

function getPublicState() {
  return {
    ownVessel: state.ownVessel,
    contacts: state.contacts,
    sensors: state.sensors,
    riskAssessment: state.riskAssessment,
    alertCount: state.alerts.filter(a => !a.acknowledged).length,
    timestamp: Date.now()
  };
}

// ─── REST API ─────────────────────────────────────────────────────────────────

// Full state
app.get('/api/state', (req, res) => res.json(getPublicState()));

// Own vessel
app.get('/api/vessel', (req, res) => res.json(state.ownVessel));
app.patch('/api/vessel', (req, res) => {
  const allowed = ['heading', 'speed'];
  allowed.forEach(k => { if (req.body[k] !== undefined) state.ownVessel[k] = req.body[k]; });
  broadcast({ type: 'VESSEL_UPDATE', payload: state.ownVessel });
  res.json(state.ownVessel);
});

// Contacts
app.get('/api/contacts', (req, res) => {
  const { threatLevel, category } = req.query;
  let contacts = state.contacts;
  if (threatLevel) contacts = contacts.filter(c => c.threatLevel === threatLevel);
  if (category) contacts = contacts.filter(c => c.category === category);
  res.json(contacts);
});

app.get('/api/contacts/:id', (req, res) => {
  const c = state.contacts.find(c => c.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Contact not found' });
  res.json(c);
});

app.patch('/api/contacts/:id', (req, res) => {
  const c = state.contacts.find(c => c.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  const allowed = ['threatLevel', 'category', 'notes'];
  allowed.forEach(k => { if (req.body[k] !== undefined) c[k] = req.body[k]; });
  broadcast({ type: 'CONTACT_UPDATE', payload: c });
  res.json(c);
});

// Sensors
app.get('/api/sensors', (req, res) => res.json(state.sensors));

// Alerts
app.get('/api/alerts', (req, res) => {
  const { acknowledged, severity, limit = 20 } = req.query;
  let alerts = [...state.alerts];
  if (acknowledged !== undefined) alerts = alerts.filter(a => a.acknowledged === (acknowledged === 'true'));
  if (severity) alerts = alerts.filter(a => a.severity === severity);
  res.json(alerts.slice(0, parseInt(limit)));
});

app.patch('/api/alerts/:id/acknowledge', (req, res) => {
  const alert = state.alerts.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  alert.acknowledged = true;
  broadcast({ type: 'ALERT_ACKNOWLEDGED', payload: { id: alert.id } });
  res.json(alert);
});

app.post('/api/alerts/acknowledge-all', (req, res) => {
  state.alerts.forEach(a => a.acknowledged = true);
  broadcast({ type: 'ALL_ACKNOWLEDGED' });
  res.json({ success: true, count: state.alerts.length });
});

// Risk assessment
app.get('/api/risk', (req, res) => res.json(state.riskAssessment));

// Emergency broadcast
app.post('/api/emergency', (req, res) => {
  const { type, message } = req.body;
  const alert = {
    id: uuidv4(), severity: 'high', time: Date.now(),
    category: 'EMERGENCY', message: message || `Emergency: ${type}`,
    acknowledged: false, isEmergency: true
  };
  state.alerts.unshift(alert);
  broadcast({ type: 'EMERGENCY', payload: alert });
  res.json({ success: true, alert });
});

// Health
app.get('/api/health', (req, res) => res.json({
  status: 'ok', uptime: process.uptime(),
  contacts: state.contacts.length,
  wsClients: wss.clients.size,
  timestamp: Date.now()
}));

// ─── WebSocket ────────────────────────────────────────────────────────────────
wss.on('connection', (ws) => {
  console.log('WS client connected. Total:', wss.clients.size);
  // Send full state on connect
  ws.send(JSON.stringify({ type: 'INIT', payload: getPublicState() }));

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.type === 'PING') ws.send(JSON.stringify({ type: 'PONG', t: Date.now() }));
    } catch (e) {}
  });

  ws.on('close', () => console.log('WS client disconnected. Total:', wss.clients.size));
  ws.on('error', (e) => console.error('WS error:', e.message));
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`NAVSIGHT Backend running on port ${PORT}`));
