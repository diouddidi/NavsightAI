import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

// ─── REST ──────────────────────────────────────────────────────────────────
export const api = {
  getState: () => API.get('/state').then(r => r.data),
  getAlerts: (params) => API.get('/alerts', { params }).then(r => r.data),
  acknowledgeAlert: (id) => API.patch(`/alerts/${id}/acknowledge`).then(r => r.data),
  acknowledgeAll: () => API.post('/alerts/acknowledge-all').then(r => r.data),
  patchContact: (id, body) => API.patch(`/contacts/${id}`, body).then(r => r.data),
  patchVessel: (body) => API.patch('/vessel', body).then(r => r.data),
  postEmergency: (body) => API.post('/emergency', body).then(r => r.data),
  getRisk: () => API.get('/risk').then(r => r.data),
};

// ─── WebSocket ─────────────────────────────────────────────────────────────
const WS_URL = `ws://${window.location.hostname}:4000`;

export function createWSClient(handlers) {
  let ws = null;
  let pingInterval = null;
  let reconnectTimer = null;
  let closed = false;

  function connect() {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      handlers.onConnected?.();
      pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'PING' }));
      }, 30000);
    };

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        handlers.onMessage?.(msg);
      } catch (e) {}
    };

    ws.onclose = () => {
      clearInterval(pingInterval);
      handlers.onDisconnected?.();
      if (!closed) reconnectTimer = setTimeout(connect, 3000);
    };

    ws.onerror = () => ws.close();
  }

  connect();

  return {
    disconnect() {
      closed = true;
      clearTimeout(reconnectTimer);
      clearInterval(pingInterval);
      ws?.close();
    }
  };
}
