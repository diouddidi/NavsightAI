import React, { useState } from 'react';
import { useStore } from '../store';
import { api } from '../services/api';

const CATEGORIES = ['ALL', 'PIRACY_SUSPECT', 'SUSPICIOUS', 'VERIFIED'];

export default function ThreatsPage() {
  const { contacts, updateContact } = useStore();
  const [filter, setFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');

  const filtered = filter === 'ALL' ? contacts : contacts.filter(c => c.category === filter);
  const sel = contacts.find(c => c.id === selected);

  const handleCategorize = async (id, category) => {
    const updated = await api.patchContact(id, { category, threatLevel: category === 'PIRACY_SUSPECT' ? 'high' : category === 'SUSPICIOUS' ? 'medium' : 'low' });
    updateContact(updated);
  };

  const handleNote = async () => {
    if (!selected) return;
    const updated = await api.patchContact(selected, { notes: note });
    updateContact(updated);
    setNote('');
  };

  return (
    <div style={styles.layout}>
      {/* List */}
      <div style={styles.list}>
        <div style={styles.filterRow}>
          {CATEGORIES.map(c => (
            <button
              key={c}
              style={{ ...styles.filterBtn, ...(filter === c ? styles.filterActive : {}) }}
              onClick={() => setFilter(c)}
            >
              {c === 'PIRACY_SUSPECT' ? 'PIRACY' : c}
            </button>
          ))}
        </div>
        {filtered.map(c => {
          const col = c.threatLevel === 'high' ? 'var(--red)' : c.threatLevel === 'medium' ? 'var(--amber)' : 'var(--green)';
          return (
            <div
              key={c.id}
              style={{ ...styles.card, ...(selected === c.id ? styles.cardSel : {}), borderLeftColor: col }}
              onClick={() => { setSelected(c.id); setNote(c.notes || ''); }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ fontWeight: 600, color: col }}>{c.name}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: col }}>{c.category}</div>
              </div>
              <div style={styles.cardMeta}>
                <span>Speed: <b>{c.speed?.toFixed(1)} kn</b></span>
                <span>Hdg: <b>{Math.round(c.heading)}°</b></span>
                <span>Dist: <b>{c.distance?.toFixed(2)} NM</b></span>
              </div>
              {c.notes && <div style={styles.cardNote}>{c.notes}</div>}
            </div>
          );
        })}
      </div>

      {/* Detail panel */}
      <div style={styles.detail}>
        {sel ? (
          <>
            <div style={styles.detTitle}>{sel.name}</div>
            <div style={styles.detGrid}>
              {[
                ['MMSI', sel.mmsi || 'UNKNOWN'],
                ['Type', sel.type || 'Unknown'],
                ['Speed', `${sel.speed?.toFixed(1)} kn`],
                ['Heading', `${Math.round(sel.heading)}°`],
                ['Bearing', `${sel.bearing || '--'}°`],
                ['Distance', `${sel.distance?.toFixed(2)} NM`],
                ['Threat', sel.threatLevel.toUpperCase()],
                ['Category', sel.category],
              ].map(([k, v]) => (
                <div key={k} style={styles.detRow}>
                  <div style={styles.detKey}>{k}</div>
                  <div style={styles.detVal}>{v}</div>
                </div>
              ))}
            </div>

            <div style={styles.sectionLabel}>Reclassify</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              {['PIRACY_SUSPECT', 'SUSPICIOUS', 'VERIFIED'].map(cat => (
                <button key={cat} style={{ ...styles.catBtn, borderColor: sel.category === cat ? 'var(--cyan)' : 'var(--border)' }} onClick={() => handleCategorize(sel.id, cat)}>
                  {cat}
                </button>
              ))}
            </div>

            <div style={styles.sectionLabel}>Analyst Notes</div>
            <textarea
              style={styles.textarea}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add operational notes..."
              rows={3}
            />
            <button style={styles.saveBtn} onClick={handleNote}>Save Note</button>

            <div style={styles.sectionLabel}>Track History ({sel.track.length} pts)</div>
            <div style={styles.trackInfo}>
              {sel.track.length > 0
                ? `Last position: ${sel.track[sel.track.length-1].lat.toFixed(4)}°N ${sel.track[sel.track.length-1].lon.toFixed(4)}°E`
                : 'No track data yet'}
            </div>
          </>
        ) : (
          <div style={{ color: 'var(--text-dim)', fontSize: 12, padding: '20px 0' }}>Select a contact to see details</div>
        )}
      </div>
    </div>
  );
}

const styles = {
  layout: { display: 'flex', flex: 1, overflow: 'hidden' },
  list: { flex: 1, overflowY: 'auto', padding: '14px', borderRight: '1px solid var(--border)' },
  filterRow: { display: 'flex', gap: 6, marginBottom: 12 },
  filterBtn: { fontFamily: 'var(--mono)', fontSize: 10, padding: '4px 10px', borderRadius: 3, background: 'none', border: '1px solid var(--border)', color: 'var(--text-dim)', cursor: 'pointer' },
  filterActive: { background: 'rgba(0,180,230,0.12)', color: 'var(--cyan)', borderColor: 'var(--border2)' },
  card: { background: 'var(--ocean)', border: '1px solid var(--border)', borderLeft: '3px solid transparent', borderRadius: 4, padding: '10px 12px', marginBottom: 8, cursor: 'pointer', transition: 'all 0.15s' },
  cardSel: { borderColor: 'var(--border2)', background: 'rgba(0,180,230,0.08)' },
  cardMeta: { display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--mono)' },
  cardNote: { marginTop: 5, fontSize: 11, color: 'var(--text-dim)', fontStyle: 'italic' },
  detail: { width: 320, flexShrink: 0, padding: '16px', overflowY: 'auto', background: 'var(--ocean)' },
  detTitle: { fontFamily: 'var(--mono)', fontSize: 15, color: 'var(--cyan)', marginBottom: 12 },
  detGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginBottom: 14 },
  detRow: { padding: '5px 0', borderBottom: '1px solid rgba(0,180,230,0.05)' },
  detKey: { fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.07em' },
  detVal: { fontFamily: 'var(--mono)', fontSize: 12, marginTop: 2 },
  sectionLabel: { fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--cyan)', letterSpacing: '0.1em', marginBottom: 8, marginTop: 2 },
  catBtn: { fontFamily: 'var(--mono)', fontSize: 10, padding: '4px 10px', borderRadius: 3, background: 'none', border: '1px solid', color: 'var(--text)', cursor: 'pointer' },
  textarea: { width: '100%', background: 'var(--steel)', border: '1px solid var(--border)', borderRadius: 4, padding: 8, color: 'var(--text)', fontFamily: 'var(--sans)', fontSize: 12, resize: 'vertical', outline: 'none' },
  saveBtn: { marginTop: 8, padding: '6px 14px', background: 'rgba(0,180,230,0.12)', border: '1px solid var(--border2)', color: 'var(--cyan)', fontFamily: 'var(--mono)', fontSize: 11, borderRadius: 3, cursor: 'pointer' },
  trackInfo: { fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)' }
};
