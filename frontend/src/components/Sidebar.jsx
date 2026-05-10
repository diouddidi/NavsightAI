import React from 'react';
import { useStore } from '../store';
import { api } from '../services/api';
import { formatDistanceToNow } from 'date-fns';

const SEVERITY_COLOR = { high: 'var(--red)', warn: 'var(--amber)', info: 'var(--cyan)' };
const THREAT_DOT = {
  high: { background: 'var(--red)', boxShadow: '0 0 6px var(--red)' },
  medium: { background: 'var(--amber)', boxShadow: '0 0 6px var(--amber)' },
  low: { background: 'var(--green)' }
};

export default function Sidebar() {
  const { contacts, sensors, alerts, riskAssessment, selectedContactId, setSelectedContact, acknowledgeAlert } = useStore();

  const handleAck = async (id) => {
    await api.acknowledgeAlert(id);
    acknowledgeAlert(id);
  };

  return (
    <aside style={styles.sidebar}>
      {/* Active Contacts */}
      <div style={styles.panel}>
        <div style={styles.panelTitle}>📡 Active Contacts</div>
        {contacts.map(c => (
          <div
            key={c.id}
            style={{ ...styles.contactRow, ...(selectedContactId === c.id ? styles.contactSelected : {}) }}
            onClick={() => setSelectedContact(c.id === selectedContactId ? null : c.id)}
          >
            <div style={{ ...styles.dot, ...THREAT_DOT[c.threatLevel] }}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
              {c.notes && <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{c.notes.slice(0,40)}</div>}
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={styles.dist}>{c.distance ? c.distance.toFixed(1) : '--'} NM</div>
              <div style={{ ...styles.tag, color: c.threatLevel === 'high' ? 'var(--red)' : c.threatLevel === 'medium' ? 'var(--amber)' : 'var(--green)' }}>
                {c.category}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sensors */}
      <div style={styles.panel}>
        <div style={styles.panelTitle}>🔧 Onboard Sensors</div>
        <div style={styles.sensorGrid}>
          {sensors && Object.entries({
            'ENGINE TEMP': sensors.engineTemp,
            'BILGE': sensors.bilgeWater,
            'MOORING': sensors.mooringTension,
            'FIRE': sensors.fireDetection,
            'GAS H₂S': sensors.gasH2S,
            'CREW IoT': sensors.crewBeacons,
          }).map(([label, s]) => s && (
            <div key={label} style={styles.sensorCard}>
              <div style={styles.sensorLabel}>{label}</div>
              <div style={{
                ...styles.sensorVal,
                color: s.status === 'ok' ? 'var(--green)' : s.status === 'warn' ? 'var(--amber)' : 'var(--red)'
              }}>
                {s.value !== undefined
                  ? (typeof s.value === 'number' ? `${s.value}${s.unit || ''}` : s.value)
                  : `${s.active}/${s.total}`
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Feed */}
      <div style={styles.panel}>
        <div style={{ ...styles.panelTitle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚡ Alert Feed</span>
          <button style={styles.ackBtn} onClick={() => api.acknowledgeAll()}>Ack All</button>
        </div>
        <div style={styles.alertFeed}>
          {alerts.slice(0, 8).map(a => (
            <div key={a.id} style={{ ...styles.alertRow, opacity: a.acknowledged ? 0.5 : 1 }} className={a.acknowledged ? '' : 'slide-in'}>
              <div style={{ ...styles.alertSev, color: SEVERITY_COLOR[a.severity] || 'var(--text-dim)' }}>
                {a.severity.toUpperCase().slice(0, 4)}
              </div>
              <div style={{ flex: 1, fontSize: 11, lineHeight: 1.4 }}>{a.message}</div>
              {!a.acknowledged && (
                <button style={styles.ackDot} onClick={() => handleAck(a.id)} title="Acknowledge">✓</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI Risk */}
      <div style={styles.panel}>
        <div style={styles.panelTitle}>🤖 AI Risk Assessment</div>
        {riskAssessment && (
          <div style={styles.aiBox}>
            <div style={styles.aiLabel}>NAVSIGHT-GPT ANALYSIS</div>
            <div style={{ fontSize: 11, lineHeight: 1.6, marginBottom: 10 }}>{riskAssessment.recommendation}</div>
            {[
              { label: 'Piracy Risk', val: riskAssessment.piracy, color: 'var(--red)' },
              { label: 'Collision Risk', val: riskAssessment.collision, color: 'var(--amber)' },
              { label: 'Crew Safety', val: riskAssessment.crewSafety, color: 'var(--green)' },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-dim)', marginBottom: 3 }}>
                  <span>{item.label}</span>
                  <span style={{ color: item.color }}>{Math.round(item.val)}%</span>
                </div>
                <div style={styles.bar}>
                  <div style={{ ...styles.barFill, width: `${item.val}%`, background: item.color }}/>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

const styles = {
  sidebar: { background: 'var(--ocean)', display: 'flex', flexDirection: 'column', overflowY: 'auto', width: 300, flexShrink: 0, borderLeft: '1px solid var(--border)' },
  panel: { padding: '12px 14px', borderBottom: '1px solid var(--border)' },
  panelTitle: { fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--cyan)', letterSpacing: '0.1em', marginBottom: 10 },
  contactRow: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
    borderRadius: 4, marginBottom: 4, cursor: 'pointer',
    border: '1px solid transparent', transition: 'all 0.15s'
  },
  contactSelected: { background: 'rgba(0,180,230,0.1)', borderColor: 'var(--border2)' },
  dot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  dist: { fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)' },
  tag: { fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.04em' },
  sensorGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 },
  sensorCard: { background: 'var(--steel)', borderRadius: 4, padding: 8, border: '1px solid var(--border)' },
  sensorLabel: { fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', marginBottom: 3 },
  sensorVal: { fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700 },
  alertFeed: { maxHeight: 180, overflowY: 'auto' },
  alertRow: { display: 'flex', alignItems: 'flex-start', gap: 8, padding: '5px 0', borderBottom: '1px solid rgba(0,180,230,0.06)' },
  alertSev: { fontFamily: 'var(--mono)', fontSize: 9, flexShrink: 0, paddingTop: 2 },
  ackBtn: { fontFamily: 'var(--mono)', fontSize: 9, background: 'none', border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '2px 6px', borderRadius: 3, cursor: 'pointer' },
  ackDot: { fontFamily: 'var(--mono)', fontSize: 9, background: 'none', border: '1px solid var(--border)', color: 'var(--green)', padding: '1px 5px', borderRadius: 3, cursor: 'pointer', flexShrink: 0 },
  aiBox: { background: 'rgba(0,180,200,0.06)', border: '1px solid rgba(0,180,230,0.2)', borderRadius: 4, padding: 10 },
  aiLabel: { fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--cyan)', letterSpacing: '0.1em', marginBottom: 6 },
  bar: { height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 2, transition: 'width 0.5s' }
};
