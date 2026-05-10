import React from 'react';
import { useStore } from '../store';

const TABS = [
  { id: 'radar',   label: 'Radar Overview' },
  { id: 'vessels', label: 'Vessel Tracker' },
  { id: 'threats', label: 'Threat Intel' },
  { id: 'crew',    label: 'Crew Safety' },
  { id: 'analytics', label: 'AI Analytics' },
];

export default function NavTabs() {
  const { activeTab, setActiveTab } = useStore();
  return (
    <nav style={styles.nav}>
      {TABS.map(t => (
        <button
          key={t.id}
          style={{ ...styles.tab, ...(activeTab === t.id ? styles.active : {}) }}
          onClick={() => setActiveTab(t.id)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}

const styles = {
  nav: {
    background: 'var(--ocean)', borderBottom: '1px solid var(--border)',
    display: 'flex', padding: '0 20px', gap: 2, flexShrink: 0
  },
  tab: {
    fontFamily: 'var(--mono)', fontSize: 11, padding: '10px 16px', cursor: 'pointer',
    color: 'var(--text-dim)', borderBottom: '2px solid transparent', background: 'none',
    border: 'none', borderBottom: '2px solid transparent',
    transition: 'all 0.2s', letterSpacing: '0.05em'
  },
  active: { color: 'var(--cyan)', borderBottom: '2px solid var(--cyan)' }
};
