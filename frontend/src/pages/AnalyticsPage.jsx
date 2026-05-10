import React, { useMemo } from 'react';
import { useStore } from '../store';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function genHistory(base, noise, pts) {
  return Array.from({ length: pts }, (_, i) => ({
    t: `${String(Math.floor((Date.now() - (pts - i) * 60000) / 60000 % 60)).padStart(2,'0')}m`,
    v: Math.max(0, Math.min(100, base + (Math.random() - 0.5) * noise))
  }));
}

const RADAR_AXES = [
  { subject: 'Piracy', fullMark: 100 },
  { subject: 'Collision', fullMark: 100 },
  { subject: 'Weather', fullMark: 100 },
  { subject: 'Mechanical', fullMark: 100 },
  { subject: 'Crew', fullMark: 100 },
  { subject: 'Cyber', fullMark: 100 },
];

export default function AnalyticsPage() {
  const { riskAssessment, contacts } = useStore();

  const riskHistory = useMemo(() => genHistory(65, 20, 20), []);
  const pirHistory = useMemo(() => genHistory(72, 15, 20), []);
  const speedDist = useMemo(() => [
    { range: '0-5', count: 2 }, { range: '5-10', count: 4 },
    { range: '10-15', count: contacts.filter(c => c.speed >= 10 && c.speed < 15).length + 3 },
    { range: '15-20', count: 2 }, { range: '20+', count: contacts.filter(c => c.speed >= 20).length },
  ], [contacts]);

  const radarData = riskAssessment ? [{
    piracy: riskAssessment.piracy,
    collision: riskAssessment.collision,
    weather: riskAssessment.weather,
    mechanical: riskAssessment.mechanical,
    crew: riskAssessment.crewSafety,
    cyber: 15
  }] : [];

  const tooltipStyle = { background: 'var(--ocean)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 11 };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.title}>AI Analytics Dashboard</div>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>
          Model: NAVSIGHT-GPT · Updated: {riskAssessment ? new Date(riskAssessment.lastUpdated).toLocaleTimeString() : '--'}
        </div>
      </div>

      <div style={styles.grid}>
        {/* Overall risk trend */}
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>Overall Risk Score (last 20 min)</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={riskHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,180,230,0.06)"/>
              <XAxis dataKey="t" tick={{ fill: 'var(--text-dim)', fontSize: 9, fontFamily: 'Space Mono' }}/>
              <YAxis domain={[0,100]} tick={{ fill: 'var(--text-dim)', fontSize: 9, fontFamily: 'Space Mono' }}/>
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'var(--cyan)' }}/>
              <Area type="monotone" dataKey="v" stroke="#f59e0b" fill="rgba(245,158,11,0.15)" name="Risk %"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Piracy risk trend */}
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>Piracy Risk Index (live)</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={pirHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,180,230,0.06)"/>
              <XAxis dataKey="t" tick={{ fill: 'var(--text-dim)', fontSize: 9, fontFamily: 'Space Mono' }}/>
              <YAxis domain={[0,100]} tick={{ fill: 'var(--text-dim)', fontSize: 9, fontFamily: 'Space Mono' }}/>
              <Tooltip contentStyle={tooltipStyle}/>
              <Line type="monotone" dataKey="v" stroke="#ef4444" dot={false} strokeWidth={2} name="Piracy %"/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Speed distribution */}
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>Contact Speed Distribution (kn)</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={speedDist}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,180,230,0.06)"/>
              <XAxis dataKey="range" tick={{ fill: 'var(--text-dim)', fontSize: 10, fontFamily: 'Space Mono' }}/>
              <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 9, fontFamily: 'Space Mono' }}/>
              <Tooltip contentStyle={tooltipStyle}/>
              <Bar dataKey="count" fill="rgba(0,180,230,0.6)" name="Vessels"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk radar */}
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>Multi-Domain Risk Radar</div>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={RADAR_AXES}>
              <PolarGrid stroke="rgba(0,180,230,0.15)"/>
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-dim)', fontSize: 10, fontFamily: 'Space Mono' }}/>
              {radarData.length > 0 && (
                <Radar
                  dataKey={d => radarData[0][d.subject?.toLowerCase()] ?? 20}
                  stroke="#00d4ff" fill="rgba(0,212,255,0.15)" fillOpacity={1}
                />
              )}
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Recommendation */}
      <div style={styles.recs}>
        <div style={styles.recTitle}>🤖 AI Tactical Recommendations</div>
        <div style={styles.recGrid}>
          {[
            { priority: 'CRITICAL', icon: '🔴', text: 'Transmit UKMTO notification for contact UNKNOWN-7 immediately. Vessel exhibits speed/bearing consistent with 2024 Gulf of Aden piracy vectors.' },
            { priority: 'HIGH', icon: '🟠', text: 'Increase speed to 16 kn and alter course to 070° to open CPA with UNKNOWN-7 to >3 NM. Activate citadel protocol.' },
            { priority: 'MEDIUM', icon: '🟡', text: 'Inspect mooring line #3. Tension at 97.5% of rated load. Risk of snap-back if line parts in current sea state.' },
            { priority: 'LOW', icon: '🟢', text: 'Schedule crew safety drill for next port entry. Mooring gang to review snap-back zone protocols.' },
          ].map((r, i) => (
            <div key={i} style={{ ...styles.recCard, borderLeftColor: r.icon === '🔴' ? 'var(--red)' : r.icon === '🟠' ? 'var(--amber)' : r.icon === '🟡' ? 'var(--amber)' : 'var(--green)' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 5 }}>
                <span>{r.icon}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)' }}>{r.priority}</span>
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.6 }}>{r.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' },
  header: { padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--ocean)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 },
  title: { fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--cyan)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 12, padding: '16px 20px' },
  chartCard: { background: 'var(--ocean)', border: '1px solid var(--border)', borderRadius: 6, padding: '12px 14px' },
  chartTitle: { fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--cyan)', letterSpacing: '0.07em', marginBottom: 10 },
  recs: { padding: '0 20px 20px' },
  recTitle: { fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--cyan)', marginBottom: 10 },
  recGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 10 },
  recCard: { background: 'var(--ocean)', border: '1px solid var(--border)', borderLeft: '3px solid', borderRadius: 4, padding: '10px 12px' }
};
