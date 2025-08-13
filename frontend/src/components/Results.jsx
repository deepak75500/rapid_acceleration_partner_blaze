import React from 'react';

function formatKm(km) { return `${km} km`; }
function formatPrice(p) { return `Rs ${p}`; }
function minutesToHHMM(m) {
  if (m == null) return '';
  const hh = Math.floor(m / 60) % 24;
  const mm = m % 60;
  return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
}

export default function Results({ results = [], meta }) {
  if (!results.length) {
    return <div className="no-results">No trains available for selected route.</div>;
  }

  const cheapestPrice = meta?.cheapestPrice ?? null;

  return (
    <>
      <div style={{color:'var(--muted)',marginBottom:10}}>Found {results.length} option(s)</div>
      <div className="results-grid">
        {results.map((r, idx) => {
          if (r.type === 'direct') {
            const isCheapest = cheapestPrice !== null && Math.abs(r.price - cheapestPrice) < 0.001;
            return (
              <div key={idx} className={`card ${isCheapest ? 'cheapest' : ''}`}>
                <div className="train-name">{r.trainName} <span style={{fontSize:12,color:'var(--muted)',marginLeft:8}}>{r.trainId}</span></div>
                <div className="route">{r.departStation} ({r.departTime}) → {r.arriveStation} ({r.arriveTime}) <span className="badge">{formatPrice(r.price)}</span></div>
                <div className="meta">Distance: {formatKm(r.distanceKm)}</div>
              </div>
            );
          } else if (r.type === 'connection') {
            const isCheapest = cheapestPrice !== null && Math.abs(r.totalPrice - cheapestPrice) < 0.001;
            return (
              <div key={idx} className={`card connection ${isCheapest ? 'cheapest' : ''}`}>
                <div className="train-name">Connection</div>
                {r.segments.map((s, i) => (
                  <div key={i} style={{marginTop:8}}>
                    <div style={{fontWeight:700}}>{s.trainName}</div>
                    <div className="route">{s.from} ({s.departTime}) → {s.to} ({s.arriveTime}) <span className="badge">{formatPrice(s.price)}</span></div>
                    <div className="meta">Distance: {formatKm(s.distanceKm)}</div>
                  </div>
                ))}
                <div style={{marginTop:10,fontWeight:700}}>Total: {formatKm(r.totalDistanceKm)} — <span className="badge">{formatPrice(r.totalPrice)}</span></div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </>
  );
}
