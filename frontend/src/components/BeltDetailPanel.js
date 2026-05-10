import React from 'react';

function formatNumber(value) {
  return Math.round(value || 0).toLocaleString();
}

function BeltDetailPanel({ data, selectedBelt, onSelectBelt }) {
  const belts = Array.from(new Set(data.map(item => item.belt))).sort();
  const rows = data.filter(item => item.belt === selectedBelt);
  const areaGroup = rows[0]?.area_group || '';
  const gross = rows.reduce((sum, item) => sum + (item.gross_volume || 0), 0);
  const scanned = rows.reduce((sum, item) => sum + (item.scanned_volume || 0), 0);
  const paidDay = rows.reduce((sum, item) => sum + (item.paid_day || 0), 0);
  const ot = rows.reduce((sum, item) => sum + (item.overtime_hours || 0), 0);
  const staffing = rows.reduce((sum, item) => sum + (item.staffing_level || 0), 0);
  const plannedHours = rows.reduce((sum, item) => sum + (item.planned_hours || 0), 0);
  const avgStaffing = rows.length ? staffing / rows.length : 0;
  const avgVolume = rows.length ? gross / rows.length : 0;
  const pphVolume = areaGroup === 'Outbounds' ? scanned : gross;
  const pph = paidDay ? pphVolume / paidDay : 0;
  const dailyTotals = rows.reduce((totals, item) => {
    totals[item.date] = (totals[item.date] || 0) + (
      areaGroup === 'Outbounds' ? (item.scanned_volume || 0) : (item.gross_volume || 0)
    );

    return totals;
  }, {});
  const peakDay = Math.max(0, ...Object.values(dailyTotals));
  const metricLabel = areaGroup === 'Outbounds' ? 'Scanned' : 'Handled';
  const peakLabel = areaGroup === 'Outbounds' ? 'Peak scan day' : 'Peak volume day';

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
        <div><span>Area group</span><strong>{areaGroup || '--'}</strong></div>
        <div><span>Gross</span><strong>{formatNumber(gross)}</strong></div>
        <div><span>{metricLabel}</span><strong>{formatNumber(pphVolume)}</strong></div>
        <div><span>{peakLabel}</span><strong>{formatNumber(peakDay)}</strong></div>
        <div><span>Avg volume</span><strong>{formatNumber(avgVolume)}</strong></div>
        <div><span>Avg staff</span><strong>{avgStaffing.toFixed(1)}</strong></div>
        <div><span>Actual PPH</span><strong>{formatNumber(pph)}</strong></div>
        <div><span>Planned hrs</span><strong>{plannedHours.toFixed(1)}</strong></div>
        <div><span>Paid day</span><strong>{paidDay.toFixed(1)}</strong></div>
        <div><span>Overtime</span><strong>{ot.toFixed(1)}</strong></div>
      </div>
    </section>
  );
}

export default BeltDetailPanel;
