import { useEffect, useRef } from 'react';
import { useStore } from '../store';
import { api, createWSClient } from '../services/api';

export function useNavsight() {
  const wsRef = useRef(null);
  const store = useStore();

  useEffect(() => {
    // Load initial data via REST
    api.getState().then(state => store.applyInit(state)).catch(console.error);
    api.getAlerts({ limit: 30 }).then(alerts => store.setAlerts(alerts)).catch(console.error);

    // Open WebSocket
    wsRef.current = createWSClient({
      onConnected: () => store.setConnected(true),
      onDisconnected: () => store.setConnected(false),
      onMessage: (msg) => {
        switch (msg.type) {
          case 'INIT':
            store.applyInit(msg.payload);
            break;
          case 'STATE_UPDATE':
            store.applyUpdate(msg.payload);
            break;
          case 'NEW_ALERT':
            store.addAlert(msg.payload);
            break;
          case 'ALERT_ACKNOWLEDGED':
            store.acknowledgeAlert(msg.payload.id);
            break;
          case 'ALL_ACKNOWLEDGED':
            store.acknowledgeAll();
            break;
          case 'CONTACT_UPDATE':
            store.updateContact(msg.payload);
            break;
          case 'EMERGENCY':
            store.addAlert(msg.payload);
            break;
          default: break;
        }
      }
    });

    return () => wsRef.current?.disconnect();
  }, []); // eslint-disable-line
}
