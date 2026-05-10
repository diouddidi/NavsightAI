import { create } from 'zustand';

export const useStore = create((set, get) => ({
  // Connection
  connected: false,
  setConnected: (v) => set({ connected: v }),

  // Data
  ownVessel: null,
  contacts: [],
  sensors: {},
  alerts: [],
  riskAssessment: null,
  alertCount: 0,

  // UI
  activeTab: 'radar',
  setActiveTab: (tab) => set({ activeTab: tab }),
  selectedContactId: null,
  setSelectedContact: (id) => set({ selectedContactId: id }),
  mapLayer: 'radar',
  setMapLayer: (l) => set({ mapLayer: l }),

  // Actions
  applyInit: (payload) => set({
    ownVessel: payload.ownVessel,
    contacts: payload.contacts,
    sensors: payload.sensors,
    riskAssessment: payload.riskAssessment,
    alertCount: payload.alertCount
  }),

  applyUpdate: (payload) => set({
    ownVessel: payload.ownVessel,
    contacts: payload.contacts,
    sensors: payload.sensors,
    riskAssessment: payload.riskAssessment,
    alertCount: payload.alertCount
  }),

  setAlerts: (alerts) => set({ alerts }),

  addAlert: (alert) => set(s => ({
    alerts: [alert, ...s.alerts].slice(0, 50),
    alertCount: s.alertCount + 1
  })),

  acknowledgeAlert: (id) => set(s => ({
    alerts: s.alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a),
    alertCount: Math.max(0, s.alertCount - 1)
  })),

  acknowledgeAll: () => set(s => ({
    alerts: s.alerts.map(a => ({ ...a, acknowledged: true })),
    alertCount: 0
  })),

  updateContact: (updated) => set(s => ({
    contacts: s.contacts.map(c => c.id === updated.id ? updated : c)
  })),

  selectedContact: () => {
    const { contacts, selectedContactId } = get();
    return contacts.find(c => c.id === selectedContactId) || null;
  }
}));
