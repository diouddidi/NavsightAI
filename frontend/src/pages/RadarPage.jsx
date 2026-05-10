import React from 'react';
import RadarSVG from '../components/RadarSVG';
import Sidebar from '../components/Sidebar';
import { useStore } from '../store';

const LAYERS = ['RADAR', 'AIS', 'SAT', 'THERMAL'];

export default function RadarPage() {
  const { ownVessel, mapLayer, setMapLayer } = useStore();

  return (
    <div style={styles.layout}>
      {/* Map area */}
      <div style={styles.mapArea}>
        {/* Vessel info overlay */}
        {ownVessel && (
          <div style={styles.vesselInfo}>
            <div style={styles.viName}>{ownVessel.name}</div>
            {[
              ['Speed', `${ownVessel.speed} kn`],
              ['Heading', `${ownVessel.heading}°`],
              ['MMSI', ownVessel.mmsi],
              ['Next port', ownVessel.nextPort],
              ['Crew', ownVessel.crew],
            ].map(([k, v]) => (
              <div key={k} style={styles.viRow}>
                <span style={{ color: 'var(--text-dim)' }}>{k}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{v}</span>
              </div>
            ))}
          </div>
        )}

        <RadarSVG />

        {/* Map controls */}
        <div style={styles.controls}>
          {LAYERS.map(l => (
            <button
              key={l}
              style={{ ...styles.ctrlBtn, ...(mapLayer === l ? styles.ctrlActive : {}) }}
              onClick={() => setMapLayer(l)}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <Sidebar />
    </div>
  );
}

const styles = {
  layout: { display: 'flex', flex: 1, overflow: 'hidden' },
  mapArea: { flex: 1, background: 'var(--navy)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  vesselInfo: {
    position: 'absolute', top: 12, left: 12, zIndex: 10,
    background: 'rgba(10,22,40,0.92)', border: '1px solid rgba(0,180,230,0.3)',
    borderRadius: 4, padding: '10px 12px', minWidth: 160
  },
  viName: { fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--cyan)', marginBottom: 6 },
  viRow: { display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 11, padding: '2px 0', color: 'var(--text-dim)' },
  controls: { position: 'absolute', bottom: 12, left: 12, display: 'flex', gap: 6, zIndex: 10 },
  ctrlBtn: {
    background: 'rgba(13,36,68,0.85)', border: '1px solid var(--border)',
    color: 'var(--text-dim)', fontFamily: 'var(--mono)', fontSize: 10,
    padding: '5px 10px', borderRadius: 3, cursor: 'pointer', letterSpacing: '0.05em'
  },
  ctrlActive: { background: 'rgba(0,180,230,0.15)', color: 'var(--cyan)', borderColor: 'var(--border2)' }
};
