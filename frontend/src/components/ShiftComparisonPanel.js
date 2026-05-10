import React from 'react';

function getRows(data) {
  const grouped = {};

  data.forEach(item => {
    if (!grouped[item.shift]) {
      grouped[item.shift] = {
        shift: item.shift,
        volume: 0,
        scanned: 0,
        outboundGross: 0,
        paidDay: 0,
        staffing: 0,
        records: 0,
        shiftKeys: new Set(),
      };
    }

    grouped[item.shift].volume += item.gross_volume || item.package_volume || 0;
    grouped[item.shift].scanned += item.scanned_volume || 0;
    grouped[item.shift].paidDay += item.paid_day || 0;
    grouped[item.shift].staffing += item.staffing_level || 0;
    grouped[item.shift].records += 1;
    grouped[item.shift].shiftKeys.add(`${item.date}-${item.shift}`);

    if (item.area_group === 'Outbounds') {
      grouped[item.shift].outboundGross += item.gross_volume || item.package_volume || 0;
    }
  });

  return Object.values(grouped)
    .map(row => {
      const shiftCount = Math.max(1, row.shiftKeys.size);

      return {
        ...row,
        shiftCount,
        avgVolume: row.volume / shiftCount,
        avgStaffing: row.staffing / Math.max(1, row.records),
        pph: row.paidDay ? row.volume / row.paidDay : 0,
        scanRate: row.outboundGross ? (row.scanned / row.outboundGross) * 100 : 0,
      };
    })
    .sort((a, b) => b.avgVolume - a.avgVolume);
}

function ShiftComparisonPanel({ data, loading }) {
  const rows = getRows(data);

  return (
    <section className="comparison-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Shift comparison</p>
          <h3>Volume, Labor, Scan Rate</h3>
        </div>
        <span>{loading ? 'Loading' : `${rows.length} shift types`}</span>
      </div>

      <div className="comparison-grid">
        {rows.map(row => (
          <article key={row.shift}>
            <strong>{row.shift}</strong>
            <dl>
              <div><dt>Avg volume</dt><dd>{Math.round(row.avgVolume).toLocaleString()}</dd></div>
              <div><dt>Avg staff</dt><dd>{row.avgStaffing.toFixed(1)}</dd></div>
              <div><dt>Building PPH</dt><dd>{Math.round(row.pph).toLocaleString()}</dd></div>
              <div><dt>Scan rate</dt><dd>{row.scanRate.toFixed(1)}%</dd></div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ShiftComparisonPanel;
