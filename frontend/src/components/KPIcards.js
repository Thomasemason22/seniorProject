import React from 'react';

const cards = [
  {
    label: 'Total Volume',
    key: 'total_volume',
    accent: 'blue',
    formatter: value => Math.round(value || 0).toLocaleString(),
  },
  {
    label: 'Avg Throughput',
    key: 'avg_throughput',
    accent: 'green',
    formatter: value => Math.round(value || 0).toLocaleString(),
  },
  {
    label: 'Avg Staffing',
    key: 'avg_staffing',
    accent: 'amber',
    formatter: value => Number(value || 0).toFixed(1),
  },
  {
    label: 'Overtime Hours',
    key: 'total_overtime',
    accent: 'red',
    formatter: value => Math.round(value || 0).toLocaleString(),
  },
  {
    label: 'Records',
    key: 'records',
    accent: 'slate',
    formatter: value => Math.round(value || 0).toLocaleString(),
  },
  {
    label: 'Peak Volume',
    key: 'peak_volume',
    accent: 'purple',
    formatter: value => Math.round(value || 0).toLocaleString(),
  },
];

function KPIcards({ kpis, loading }) {
  return (
    <div className="kpi-grid">
      {cards.map(card => (
        <article className={`metric-card ${card.accent}`} key={card.key}>
          <div className="metric-topline">
            <span>{card.label}</span>
            <i aria-hidden="true" />
          </div>
          <strong>{loading ? '--' : card.formatter(kpis[card.key])}</strong>
        </article>
      ))}
    </div>
  );
}

export default KPIcards;
