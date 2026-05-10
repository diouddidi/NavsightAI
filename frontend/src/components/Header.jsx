import React, { useEffect, useState } from 'react';
import { useStore } from '../store';

export default function Header() {
  const { connected, alertCount, ownVessel } = useStore();
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toUTCString().split(' ')[4] + ' UTC');
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header style={styles.header}>
      <div style={styles.logo}>
        <div style={styles.hex} />
        <div>
          <div style={styles.logoText}>NAVSIGHT · AI</div>
          <div style={styles.logoSub}>Maritime Situational Awareness Platform</div>
        </div>
      </div>

      <div style={styles.center}>
        {ownVessel && (
          <span style={styles.vesselPill}>
            <span style={{ color: 'var(--cyan)' }}>▲</span>{' '}
            {ownVessel.name} &nbsp;·&nbsp; {ownVessel.speed} kn &nbsp;·&nbsp; {ownVessel.heading}°
          </span>
        )}
      </div>

      <div style={styles.right}>
        <span style={{ ...styles.badge, ...(connected ? styles.live : styles.offline) }}>
          {connected ? '● LIVE' : '○ OFFLINE'}
        </span>
        {alertCount > 0 && (
          <span style={{ ...styles.badge, ...styles.alertBadge }} className="animate-pulse">
            ⚠ {alertCount} ALERT{alertCount > 1 ? 'S' : ''}
          </span>
        )}
        <span style={styles.clock}>{time}</span>
      </div>
    </header>
  );
}

const styles = {
  header: {
    background: 'linear-gradient(135deg,var(--ocean) 0%,#0a1f3a 100%)',
    borderBottom: '1px solid var(--border)',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexShrink: 0
  },
  logo: { display: 'flex', alignItems: 'center', gap: 10 },
  hex: {
    width: 32, height: 32,
    background: 'var(--cyan)',
    clipPath: 'polygon(50% 0%,90% 25%,90% 75%,50% 100%,10% 75%,10% 25%)',
    flexShrink: 0
  },
  logoText: { fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--cyan)', letterSpacing: '0.08em' },
  logoSub: { fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--mono)' },
  center: { flex: 1, display: 'flex', justifyContent: 'center' },
  vesselPill: {
    fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text)',
    background: 'rgba(0,180,230,0.08)', border: '1px solid var(--border)',
    padding: '4px 12px', borderRadius: 4
  },
  right: { display: 'flex', alignItems: 'center', gap: 12 },
  badge: {
    fontFamily: 'var(--mono)', fontSize: 10, padding: '3px 8px',
    borderRadius: 3, letterSpacing: '0.06em'
  },
  live: { background: 'rgba(16,185,129,0.15)', color: 'var(--green)', border: '1px solid rgba(16,185,129,0.3)' },
  offline: { background: 'rgba(239,68,68,0.15)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.3)' },
  alertBadge: { background: 'rgba(239,68,68,0.15)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.3)' },
  clock: { fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--cyan)', minWidth: 110 }
};
