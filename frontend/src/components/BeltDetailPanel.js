import React from 'react';

function BeltDetailPanel({ data, selectedBelt, onSelectBelt }) {
  const belts = Array.from(new Set(data.map(item => item.belt))).sort();
  const rows = data.filter(item => item.belt === selectedBelt);
  const gross = rows.reduce((sum, item) => sum + (item.gross_volume || 0), 0);
  const scanned = rows.reduce((sum, item) => sum + (item.scanned_volume || 0), 0);
  const paidDay = rows.reduce((sum, item) => sum + (item.paid_day || 0), 0);
  const ot = rows.reduce((sum, item) => sum + (item.overtime_hours || 0), 0);

  return (
    <section className="belt-detail-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Belt detail</p>
          <h3>{selectedBelt || 'Select a belt'}</h3>
        </div>
        <select value={selectedBelt} onChange={event => onSelectBelt(event.target.value)}>
          {belts.map(belt => <option key={belt}>{belt}</option>)}
        </select>
      </div>
      <div className="report-grid">
        <div><span>Records</span><strong>{rows.length}</strong></div>
        <div><span>Gross</span><strong>{gross.toLocaleString()}</strong></div>
        <div><span>Scanned</span><strong>{scanned.toLocaleString()}</strong></div>
        <div><span>Scan rate</span><strong>{gross ? ((scanned / gross) * 100).toFixed(1) : '0.0'}%</strong></div>
        <div><span>Paid day</span><strong>{paidDay.toFixed(1)}</strong></div>
        <div><span>Overtime</span><strong>{ot.toFixed(1)}</strong></div>
      </div>
    </section>
  );
}

export default BeltDetailPanel;
