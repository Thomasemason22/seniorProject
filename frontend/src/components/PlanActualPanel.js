import React from 'react';

function PlanActualPanel({ kpis }) {
  const rows = [
    {
      label: 'Hours',
      planned: kpis.planned_hours || 0,
      actual: kpis.total_paid_day || 0,
    },
    {
      label: 'PPH',
      planned: 265,
      actual: kpis.avg_pph || 0,
    },
    {
      label: 'Outbound Scans',
      planned: kpis.outbound_gross_volume || 0,
      actual: kpis.total_scanned || 0,
    },
  ];

  return (
    <section className="plan-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Plan vs actual</p>
          <h3>Performance Variance</h3>
        </div>
      </div>
      <div className="plan-list">
        {rows.map(row => {
          const max = Math.max(row.planned, row.actual, 1);

          return (
            <article key={row.label}>
              <div>
                <strong>{row.label}</strong>
                <span>{Math.round(row.actual - row.planned).toLocaleString()} variance</span>
              </div>
              <div className="plan-bars">
                <i style={{ width: `${(row.planned / max) * 100}%` }} />
                <b style={{ width: `${(row.actual / max) * 100}%` }} />
              </div>
              <em>Plan {Math.round(row.planned).toLocaleString()} · Actual {Math.round(row.actual).toLocaleString()}</em>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default PlanActualPanel;
