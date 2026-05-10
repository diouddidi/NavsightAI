import React, { useEffect, useRef } from 'react';
import { useStore } from '../store';

const W = 500, H = 500, CX = 250, CY = 250, R = 220;
const NM_TO_PX = R / 5; // 5 NM radius

function latLonToXY(ownLat, ownLon, lat, lon) {
  const dLat = (lat - ownLat) * 60; // NM
  const dLon = (lon - ownLon) * 60 * Math.cos(ownLat * Math.PI / 180);
  const px = CX + dLon * NM_TO_PX;
  const py = CY - dLat * NM_TO_PX;
  return { x: px, y: py };
}

const THREAT_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#00d4ff' };

export default function RadarSVG() {
  const { ownVessel, contacts, selectedContactId, setSelectedContact } = useStore();
  const sweepRef = useRef(null);
  const animRef = useRef(null);
  const angleRef = useRef(0);

  useEffect(() => {
    let last = performance.now();
    function frame(now) {
      const dt = (now - last) / 1000;
      last = now;
      angleRef.current = (angleRef.current + dt * 45) % 360; // 8-second sweep
      if (sweepRef.current) {
        sweepRef.current.setAttribute('transform', `rotate(${angleRef.current},${CX},${CY})`);
      }
      animRef.current = requestAnimationFrame(frame);
    }
    animRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  if (!ownVessel) return <div style={{ flex: 1, background: '#050e1c' }} />;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: '100%', maxHeight: 500, display: 'block' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="rg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0d2444" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#050e1c" stopOpacity="1"/>
        </radialGradient>
        <radialGradient id="sg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#00d4ff" stopOpacity="0"/>
        </radialGradient>
        <clipPath id="rc"><circle cx={CX} cy={CY} r={R}/></clipPath>
      </defs>

      {/* Background */}
      <rect width={W} height={H} fill="#050e1c"/>

      {/* Grid lines */}
      {[50,100,150,200,250,300,350,400,450].map(v => (
        <React.Fragment key={v}>
          <line x1={0} y1={v} x2={W} y2={v} stroke="rgba(0,80,120,0.07)" strokeWidth="1"/>
          <line x1={v} y1={0} x2={v} y2={H} stroke="rgba(0,80,120,0.07)" strokeWidth="1"/>
        </React.Fragment>
      ))}

      {/* Radar fill */}
      <circle cx={CX} cy={CY} r={R} fill="url(#rg)" stroke="rgba(0,180,230,0.18)" strokeWidth="1"/>

      {/* Range rings */}
      {[1,2,3,4].map(nm => (
        <circle key={nm} cx={CX} cy={CY} r={nm * NM_TO_PX} fill="none" stroke="rgba(0,180,230,0.1)" strokeWidth="0.5"/>
      ))}

      {/* Crosshair */}
      <line x1={CX} y1={CY-R} x2={CX} y2={CY+R} stroke="rgba(0,180,230,0.08)" strokeWidth="0.5"/>
      <line x1={CX-R} y1={CY} x2={CX+R} y2={CY} stroke="rgba(0,180,230,0.08)" strokeWidth="0.5"/>

      {/* Range labels */}
      {[1,2,3].map(nm => (
        <text key={nm} x={CX+5} y={CY - nm * NM_TO_PX + 10} fill="rgba(0,180,230,0.4)" fontFamily="Space Mono" fontSize="8">{nm} NM</text>
      ))}

      {/* Radar sweep */}
      <g ref={sweepRef} clipPath="url(#rc)">
        <path
          d={`M${CX},${CY} L${CX},${CY-R} A${R},${R} 0 0,1 ${CX+R},${CY} Z`}
          fill="url(#sg)"
        />
        <line x1={CX} y1={CY} x2={CX} y2={CY - R} stroke="rgba(0,212,255,0.55)" strokeWidth="1.5"/>
      </g>

      {/* Contacts */}
      {contacts.map(c => {
        const pos = latLonToXY(ownVessel.lat, ownVessel.lon, c.lat, c.lon);
        if (pos.x < 0 || pos.x > W || pos.y < 0 || pos.y > H) return null;
        const color = THREAT_COLORS[c.threatLevel] || '#00d4ff';
        const selected = selectedContactId === c.id;
        return (
          <g key={c.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedContact(c.id === selectedContactId ? null : c.id)}>
            {/* Threat ring animation */}
            {c.threatLevel === 'high' && (
              <circle cx={pos.x} cy={pos.y} r="10" fill="none" stroke={color} strokeWidth="1" opacity="0.4">
                <animate attributeName="r" values="6;14;6" dur="1.8s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.6;0;0.6" dur="1.8s" repeatCount="indefinite"/>
              </circle>
            )}
            {/* Track dots */}
            {c.track.slice(-8).map((pt, i) => {
              const tp = latLonToXY(ownVessel.lat, ownVessel.lon, pt.lat, pt.lon);
              return <circle key={i} cx={tp.x} cy={tp.y} r="1.5" fill={color} opacity={0.1 + i * 0.1}/>;
            })}
            {/* Threat line to own vessel */}
            {c.threatLevel === 'high' && (
              <line x1={CX} y1={CY} x2={pos.x} y2={pos.y} stroke={color} strokeWidth="0.5" strokeDasharray="4,4" opacity="0.25"/>
            )}
            {/* Vessel shape */}
            <polygon
              points={`${pos.x},${pos.y-7} ${pos.x-4},${pos.y+5} ${pos.x},${pos.y+2} ${pos.x+4},${pos.y+5}`}
              fill={color}
              stroke={selected ? '#fff' : 'none'}
              strokeWidth={selected ? 1 : 0}
              transform={`rotate(${c.heading},${pos.x},${pos.y})`}
            />
            {/* Label */}
            {(c.threatLevel !== 'low' || selected) && (
              <text x={pos.x + 8} y={pos.y - 4} fill={color} fontFamily="Space Mono" fontSize="8" opacity="0.9">{c.name}</text>
            )}
          </g>
        );
      })}

      {/* Own vessel */}
      <g>
        <circle cx={CX} cy={CY} r="6" fill="none" stroke="var(--cyan)" strokeWidth="1.5" opacity="0.4"/>
        <polygon
          points={`${CX},${CY-10} ${CX-5},${CY+8} ${CX},${CY+4} ${CX+5},${CY+8}`}
          fill="#00d4ff"
          transform={`rotate(${ownVessel.heading},${CX},${CY})`}
        />
        <text x={CX+8} y={CY-8} fill="#00d4ff" fontFamily="Space Mono" fontSize="9" fontWeight="700">{ownVessel.name}</text>
      </g>

      {/* Scale bar */}
      <line x1="20" y1={H-30} x2={20+NM_TO_PX} y2={H-30} stroke="rgba(0,180,230,0.5)" strokeWidth="1.5"/>
      <line x1="20" y1={H-34} x2="20" y2={H-26} stroke="rgba(0,180,230,0.5)" strokeWidth="1"/>
      <line x1={20+NM_TO_PX} y1={H-34} x2={20+NM_TO_PX} y2={H-26} stroke="rgba(0,180,230,0.5)" strokeWidth="1"/>
      <text x="26" y={H-15} fill="rgba(0,180,230,0.45)" fontFamily="Space Mono" fontSize="7">1 NAUTICAL MILE</text>

      {/* Fusion label */}
      <text x={W-10} y={H-10} fill="rgba(0,180,230,0.2)" fontFamily="Space Mono" fontSize="7" textAnchor="end">AIS + RADAR FUSION</text>
    </svg>
  );
}
