import React from 'react';
import { useStore } from '../store';
import { api } from '../services/api';

const CREW = [
  { id: 1, name: 'Capt. A. Kovacs', rank: 'Master', zone: 'Bridge', beacon: 'OK' },
  { id: 2, name: 'L. Osei', rank: 'Chief Officer', zone: 'Deck A', beacon: 'OK' },
  { id: 3, name: 'R. Sánchez', rank: '2nd Officer', zone: 'Bridge', beacon: 'OK' },
  { id: 4, name: 'M. Dubois', rank: 'Chief Engineer', zone: 'Engine Room', beacon: 'OK' },
  { id: 5, name: 'T. Nakamura', rank: '2nd Engineer', zone: 'Engine Room', beacon: 'OK' },
  { id: 6, name: 'P. Nwosu', rank: 'Bosun', zone: 'Deck B', beacon: 'WARN' },
  { id: 7, name: 'G. Petrov', rank: 'AB', zone: 'Deck A', beacon: 'OK' },
  { id: 8, name: 'H. Ali', rank: 'AB', zone: 'Stern', beacon: 'OK' },
  { id: 9, name: 'C. Tran', rank: 'OS', zone: 'Mess', beacon: 'OK' },
  { id: 10, name: 'J. Adeyemi', rank: 'Cook', zone: 'Galley', beacon: 'OK' },
  { id: 11, name: 'S. Kowalski', rank: 'Electrician', zone: 'Engine Room', beacon: 'OK' },
  { id: 12, name: 'A. Braga', rank: 'Motorman', zone: 'Engine Room', beacon: 'OK' },
];

const HAZARDS = [
  { zone: 'Mooring Deck', risk: 'high', type: 'Snap-back Zone', icon: '⚠️' },
  { zone: 'Engine Room', risk: 'medium', type: 'H₂S Exposure', icon: '☢️' },
  { zone: 'Bow', risk: 'low', type: 'Slip Hazard', icon: '⚡' },
];

export default function CrewPage() {
  const { sensors } = useStore();
  const beaconsOk = CREW.filter(c => c.beacon === 'OK').length;

  const handleEmergency = async () => {
    await api.postEmergency({ type: 'MAN_OVERBOARD', message: 'MAN OVERBOARD — emergency broadcast transmitted' });
    alert('Emergency broadcast transmitted to GMDSS');
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Crew Safety Monitor</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 3 }}>
            {beaconsOk}/{CREW.length} beacons active &nbsp;·&nbsp; All IoT wearables online
          </div>
        </div>
        <button style={styles.emergencyBtn} onClick={handleEmergency}>
          🆘 MOB EMERGENCY
        </button>
      </div>

      <div style={styles.body}>
        {/* Crew roster */}
        <div style={styles.section}>
          <div style={styles.secTitle}>CREW ROSTER & LOCATION</div>
          <div style={styles.crewGrid}>
            {CREW.map(c => (
              <div key={c.id} style={{ ...styles.crewCard, borderLeftColor: c.beacon === 'WARN' ? 'var(--amber)' : 'var(--green)' }}>
                <div style={styles.crewAvatar}>
                  {c.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{c.rank}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>{c.zone}</div>
                  <div style={{ fontSize: 10, color: c.beacon === 'WARN' ? 'var(--amber)' : 'var(--green)', fontFamily: 'var(--mono)' }}>{c.beacon}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hazard zones */}
        <div style={styles.section}>
          <div style={styles.secTitle}>DECK HAZARD ZONES</div>
          {HAZARDS.map((h, i) => (
            <div key={i} style={{ ...styles.hazardRow, borderLeftColor: h.risk === 'high' ? 'var(--red)' : h.risk === 'medium' ? 'var(--amber)' : 'var(--green)' }}>
              <span style={{ fontSize: 18 }}>{h.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{h.zone}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{h.type}</div>
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: h.risk === 'high' ? 'var(--red)' : h.risk === 'medium' ? 'var(--amber)' : 'var(--green)' }}>
                {h.risk.toUpperCase()}
              </div>
            </div>
          ))}
        </div>

        {/* Environmental sensors */}
        <div style={styles.section}>
          <div style={styles.secTitle}>ENVIRONMENTAL SENSORS</div>
          <div style={styles.envGrid}>
            {sensors && [
              ['Wind Speed', sensors.windSpeed],
              ['Visibility', sensors.visibility],
              ['Sea State', sensors.seaState],
              ['Gas H₂S', sensors.gasH2S],
              ['Gas CO', sensors.gasCO],
            ].map(([label, s]) => s && (
              <div key={label} style={styles.envCard}>
                <div style={styles.envLabel}>{label}</div>
                <div style={{ ...styles.envVal, color: s.status === 'ok' ? 'var(--green)' : 'var(--amber)' }}>
                  {s.value} {s.unit || ''}
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--mono)', marginTop: 2 }}>{s.status?.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' },
  header: { padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--ocean)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 },
  title: { fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--cyan)' },
  emergencyBtn: {
    background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.5)',
    color: 'var(--red)', fontFamily: 'var(--mono)', fontSize: 11,
    padding: '8px 16px', borderRadius: 4, cursor: 'pointer', letterSpacing: '0.05em'
  },
  body: { padding: '16px 20px', display: 'flex', gap: 20, flexWrap: 'wrap' },
  section: { flex: 1, minWidth: 280 },
  secTitle: { fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--cyan)', letterSpacing: '0.1em', marginBottom: 10 },
  crewGrid: { display: 'flex', flexDirection: 'column', gap: 6 },
  crewCard: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
    background: 'var(--ocean)', border: '1px solid var(--border)', borderLeft: '3px solid',
    borderRadius: 4
  },
  crewAvatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: 'rgba(0,180,230,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--cyan)', flexShrink: 0
  },
  hazardRow: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
    background: 'var(--ocean)', border: '1px solid var(--border)', borderLeft: '3px solid',
    borderRadius: 4, marginBottom: 8
  },
  envGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 },
  envCard: { background: 'var(--ocean)', border: '1px solid var(--border)', borderRadius: 4, padding: '10px 12px' },
  envLabel: { fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.07em', marginBottom: 4 },
  envVal: { fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700 }
};
