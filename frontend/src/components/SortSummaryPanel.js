import React from 'react';

const MAX_PACKAGES_PER_HOUR = 60000;

function sumRows(rows, key) {
  return rows.reduce((sum, item) => sum + (item[key] || 0), 0);
}

function getBusiest(rows, group) {
  const grouped = {};

  rows
    .filter(item => item.area_group === group)
    .forEach(item => {
      grouped[item.belt] = (grouped[item.belt] || 0) + (item.gross_volume || item.package_volume || 0);
    });

  return Object.entries(grouped)
    .map(([belt, volume]) => ({ belt, volume }))
    .sort((a, b) => b.volume - a.volume)[0];
}

function SortSummaryPanel({ data, kpis, loading }) {
  const volume = kpis.avg_sort_volume || 0;
  const sortCount = Math.max(1, kpis.sort_count || 0);
  const scannedTotal = data.filter(item => item.area_group === 'Outbounds')
    .reduce((sum, item) => sum + (item.scanned_volume || 0), 0);
  const scanned = scannedTotal / sortCount;
  const outboundGross = data.filter(item => item.area_group === 'Outbounds')
    .reduce((sum, item) => sum + (item.gross_volume || item.package_volume || 0), 0);
  const paidDay = sumRows(data, 'paid_day') / sortCount;
  const scanRate = outboundGross ? (scannedTotal / outboundGross) * 100 : 0;
  const impliedHours = volume / MAX_PACKAGES_PER_HOUR;
  const packagesPerHour = impliedHours ? volume / impliedHours : 0;
  const busiestPd = getBusiest(data, 'Outbounds');
  const busiestUl = getBusiest(data, 'Unload');

  const cards = [
    { label: 'Building volume', value: Math.round(volume).toLocaleString() },
    { label: 'Implied shift hrs', value: impliedHours.toFixed(1) },
    { label: 'Packages/hr', value: Math.round(packagesPerHour).toLocaleString() },
    { label: 'Outbound scanned', value: Math.round(scanned).toLocaleString() },
    { label: 'Scan rate', value: `${scanRate.toFixed(1)}%` },
    { label: 'Paid day', value: Math.round(paidDay).toLocaleString() },
    { label: 'Busiest PD', value: busiestPd ? `${busiestPd.belt} ${Math.round(busiestPd.volume).toLocaleString()}` : '--' },
    { label: 'Busiest UL', value: busiestUl ? `${busiestUl.belt} ${Math.round(busiestUl.volume).toLocaleString()}` : '--' },
  ];

  return (
    <section className="sort-summary-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Shift detail</p>
          <h3>Selected Shift Summary</h3>
        </div>
        <span>{loading ? 'Loading' : `${data.length.toLocaleString()} records`}</span>
      </div>

      <div className="summary-tile-grid">
        {cards.map(card => (
          <article key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

export default SortSummaryPanel;
