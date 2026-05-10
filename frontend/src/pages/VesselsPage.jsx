import React from 'react';
import { useStore } from '../store';

const COLS = ['Name', 'MMSI', 'Type', 'Speed', 'Heading', 'Distance', 'Threat', 'Category', 'Notes'];

export default function VesselsPage() {
  const { contacts, ownVessel } = useStore();
  const all = ownVessel
    ? [{ ...ownVessel, id: 'own', threatLevel: 'own', category: 'OWN VESSEL', distance: 0, name: ownVessel.name + ' ⬡', type: ownVessel.type }, ...contacts]
    : contacts;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.title}>Vessel Tracker — {contacts.length} contacts</div>
      </div>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              {COLS.map(c => <th key={c} style={styles.th}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {all.map((c, i) => {
              const threatColor = c.threatLevel === 'high' ? 'var(--red)' : c.threatLevel === 'medium' ? 'var(--amber)' : c.threatLevel === 'own' ? 'var(--cyan)' : 'var(--green)';
              return (
                <tr key={c.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(0,180,230,0.03)' }}>
                  <td style={{ ...styles.td, color: threatColor, fontWeight: 600 }}>{c.name}</td>
                  <td style={{ ...styles.td, fontFamily: 'var(--mono)', fontSize: 11 }}>{c.mmsi || '—'}</td>
                  <td style={styles.td}>{c.type || '—'}</td>
                  <td style={{ ...styles.td, fontFamily: 'var(--mono)' }}>{c.speed ? `${c.speed.toFixed(1)} kn` : '—'}</td>
                  <td style={{ ...styles.td, fontFamily: 'var(--mono)' }}>{c.heading ? `${Math.round(c.heading)}°` : '—'}</td>
                  <td style={{ ...styles.td, fontFamily: 'var(--mono)' }}>{c.distance ? `${c.distance.toFixed(2)} NM` : '—'}</td>
                  <td style={{ ...styles.td, color: threatColor, fontFamily: 'var(--mono)', fontSize: 11 }}>
                    {c.threatLevel ? c.threatLevel.toUpperCase() : '—'}
                  </td>
                  <td style={{ ...styles.td, fontFamily: 'var(--mono)', fontSize: 11 }}>{c.category || '—'}</td>
                  <td style={{ ...styles.td, color: 'var(--text-dim)' }}>{c.notes || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  page: { flex: 1, overflowY: 'auto', background: 'var(--navy)' },
  header: { padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--ocean)' },
  title: { fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--cyan)' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: {
    fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.07em',
    padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid var(--border)',
    background: 'var(--ocean)', position: 'sticky', top: 0
  },
  td: { padding: '9px 14px', borderBottom: '1px solid rgba(0,180,230,0.05)', verticalAlign: 'middle' }
};
