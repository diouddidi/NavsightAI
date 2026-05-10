import React from 'react';
import { useStore } from '../store';

export default function MetricStrip() {
  const { contacts, sensors, riskAssessment, alertCount } = useStore();
  const threats = contacts.filter(c => c.threatLevel !== 'low').length;
  const riskScore = riskAssessment?.overall ?? '--';
  const riskColor = riskScore >= 7 ? 'var(--red)' : riskScore >= 5 ? 'var(--amber)' : 'var(--green)';
  const crewOk = sensors?.crewBeacons?.active ?? '--';
  const crewTotal = sensors?.crewBeacons?.total ?? '--';
  const crewPct = crewTotal ? Math.round((crewOk / crewTotal) * 100) : '--';

  const cards = [
    { label: 'VESSELS IN RANGE', value: contacts.length, color: 'var(--cyan)', delta: `${threats} suspect` },
    { label: 'THREAT LEVEL', value: threats > 0 ? 'MEDIUM' : 'LOW', color: threats > 0 ? 'var(--amber)' : 'var(--green)', delta: `${alertCount} active alerts` },
    { label: 'CREW SAFETY', value: `${crewPct}%`, color: 'var(--green)', delta: `${crewOk}/${crewTotal} beacons` },
    { label: 'AI RISK SCORE', value: `${riskScore}/10`, color: riskColor, delta: 'updated live' }
  ];

  return (
    <div style={styles.strip}>
      {cards.map((c, i) => (
        <div key={i} style={{ ...styles.card, borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
          <div style={styles.label}>{c.label}</div>
          <div style={{ ...styles.value, color: c.color }}>{c.value}</div>
          <div style={styles.delta}>{c.delta}</div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  strip: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', background: 'var(--ocean)', borderBottom: '1px solid var(--border)', flexShrink: 0 },
  card: { padding: '12px 16px' },
  label: { fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.07em', marginBottom: 4 },
  value: { fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 700 },
  delta: { fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }
};
