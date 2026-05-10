# NAVSIGHT AI — Maritime Situational Awareness Platform

> Real-time vessel tracking, threat detection, crew safety monitoring, and AI-powered risk analytics.

---

## Architecture

```
navsight/
├── backend/          # Node.js + Express + WebSocket API
│   ├── server.js     # Main server — REST + WS + simulation engine
│   ├── Dockerfile
│   └── package.json
├── frontend/         # React 18 SPA
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css          # Naval dark theme (CSS vars)
│   │   ├── store/index.js     # Zustand global state
│   │   ├── services/api.js    # Axios REST + WebSocket client
│   │   ├── hooks/useNavsight.js
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── NavTabs.jsx
│   │   │   ├── MetricStrip.jsx
│   │   │   ├── RadarSVG.jsx   # Animated SVG radar with live contacts
│   │   │   └── Sidebar.jsx    # Contacts + sensors + alerts + AI risk
│   │   └── pages/
│   │       ├── RadarPage.jsx
│   │       ├── VesselsPage.jsx
│   │       ├── ThreatsPage.jsx
│   │       ├── CrewPage.jsx
│   │       └── AnalyticsPage.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
└── docker-compose.yml
```

---

## Quick Start (Docker — recommended)

```bash
# 1. Clone / copy project
cd navsight

# 2. Launch full stack
docker-compose up --build

# Frontend → http://localhost:3000
# Backend API → http://localhost:4000/api
# WebSocket → ws://localhost:4000
```

---

## Local Development

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev        # nodemon, auto-reload on :4000
```

### Frontend
```bash
cd frontend
npm install
npm start          # CRA dev server on :3000, proxies /api → :4000
```

---

## REST API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/state` | Full system state snapshot |
| GET | `/api/vessel` | Own vessel data |
| PATCH | `/api/vessel` | Update heading / speed |
| GET | `/api/contacts` | All radar contacts (filterable) |
| GET | `/api/contacts/:id` | Single contact detail |
| PATCH | `/api/contacts/:id` | Reclassify / add notes |
| GET | `/api/alerts` | Alert feed (filterable) |
| PATCH | `/api/alerts/:id/acknowledge` | Acknowledge alert |
| POST | `/api/alerts/acknowledge-all` | Ack all alerts |
| GET | `/api/risk` | AI risk assessment |
| POST | `/api/emergency` | Broadcast emergency alert |

Query params for `/api/contacts`: `threatLevel`, `category`  
Query params for `/api/alerts`: `acknowledged`, `severity`, `limit`

---

## WebSocket Events

Connect to `ws://localhost:4000`

### Server → Client

| Event | Description |
|-------|-------------|
| `INIT` | Full state on connection |
| `STATE_UPDATE` | Live sim update every 2s |
| `NEW_ALERT` | New alert generated |
| `ALERT_ACKNOWLEDGED` | Alert ack'd |
| `ALL_ACKNOWLEDGED` | All alerts ack'd |
| `CONTACT_UPDATE` | Contact reclassified |
| `EMERGENCY` | Emergency broadcast |

### Client → Server

| Event | Description |
|-------|-------------|
| `PING` | Keepalive ping |

---

## Feature Overview

### 🗺 Radar Overview
- Animated SVG radar with sweep and contact blips
- Real-time vessel positions updated via WebSocket
- Track history (ghost trails) for all contacts
- Threat contacts pulse red; suspicious contacts pulse amber
- Own vessel overlay with heading indicator
- Layer switcher: RADAR / AIS / SAT / THERMAL

### 🚢 Vessel Tracker
- Full data table of all contacts with live speed/heading/distance
- Sortable, filterable by threat level and category

### ⚠️ Threat Intel
- Filterable threat list (PIRACY / SUSPICIOUS / VERIFIED)
- Analyst workflow: reclassify contacts, add notes, view track history
- One-click reclassification pushed via REST + broadcast to all WS clients

### 👷 Crew Safety
- Crew roster with IoT beacon status and deck zone
- Deck hazard zones (snap-back, gas, slip)
- Environmental sensor panel (wind, visibility, sea state, gas)
- One-click MOB Emergency button → GMDSS broadcast simulation

### 📊 AI Analytics
- Live risk trend area chart (last 20 min)
- Piracy risk index line chart
- Contact speed distribution bar chart
- Multi-domain risk radar chart (piracy / collision / weather / mechanical / crew / cyber)
- Prioritised AI tactical recommendations

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Zustand, Recharts, Lucide |
| Styling | CSS custom properties (naval dark theme) |
| Backend | Node.js, Express 4, ws (WebSocket) |
| State sync | WebSocket (push) + REST (pull) |
| Simulation | In-process engine, 2-second tick |
| Containerisation | Docker + Docker Compose + nginx |

<img width="2946" height="1740" alt="navsight_photo" src="https://github.com/user-attachments/assets/6b57bcd6-e28e-4aec-9761-3f1e56872069" />

---

## Extending for Production

- **Real AIS feed**: Replace simulation engine with AIS data feed (e.g. [AISHub](https://www.aishub.net/), [MarineTraffic API](https://www.marinetraffic.com/en/ais-api-services))
- **Real radar**: Integrate NMEA 2000 / ARPA radar data via serial bridge
- **Database**: Add PostgreSQL + TimescaleDB for track persistence
- **Auth**: Add JWT authentication (crew roles: master, officer, operator)
- **Notifications**: SMTP / satellite email alerts (Iridium/VSAT)
- **Charts**: Upgrade to Leaflet/OpenLayers for real nautical chart tiles
- **AI model**: Replace mock scores with ML model trained on piracy incident data

---

## License
MIT — free to use, modify, and distribute.
