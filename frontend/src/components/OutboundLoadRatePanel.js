import React from 'react';

const PLAN_PPH = 265;
const LOAD_RATE_GOAL = 400;

function getLoadRows(data) {
  const grouped = {};

  data
    .filter(item => item.area_group === 'Outbounds')
    .forEach(item => {
      if (!grouped[item.belt]) {
        grouped[item.belt] = {
          belt: item.belt,
          scanned: 0,
          paidDay: 0,
          records: 0,
        };
      }

      grouped[item.belt].scanned += item.scanned_volume || 0;
      grouped[item.belt].paidDay += item.paid_day || 0;
      grouped[item.belt].records += 1;
    });

  return Object.values(grouped)
    .map(row => ({
      ...row,
      loadRate: row.paidDay ? row.scanned / row.paidDay : 0,
    }))
    .sort((a, b) => b.loadRate - a.loadRate);
}

function getRateClass(rate) {
  if (rate >= LOAD_RATE_GOAL) {
    return 'goal';
  }

  if (rate >= PLAN_PPH) {
    return 'plan';
  }

  return 'below';
}

function OutboundLoadRatePanel({ data, loading }) {
  const rows = getLoadRows(data);
  const avgLoadRate = rows.length
    ? rows.reduce((sum, row) => sum + row.loadRate, 0) / rows.length
    : 0;

  return (
    <section className="load-rate-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Outbound labor</p>
          <h3>PD Employee Load Rate</h3>
        </div>
        <span>{loading ? 'Loading' : `${Math.round(avgLoadRate).toLocaleString()} avg PPH`}</span>
      </div>

      <div className="load-rate-legend">
        <span>Plan {PLAN_PPH} PPH</span>
        <span>Goal {LOAD_RATE_GOAL} PPH</span>
      </div>

      <div className="load-rate-list">
        {rows.map(row => {
          const width = Math.min(100, (row.loadRate / LOAD_RATE_GOAL) * 100);

          return (
            <article className={getRateClass(row.loadRate)} key={row.belt}>
              <div>
                <strong>{row.belt}</strong>
                <span>{Math.round(row.scanned).toLocaleString()} scans / {row.paidDay.toFixed(1)} paid hrs</span>
              </div>
              <em>{Math.round(row.loadRate).toLocaleString()} PPH</em>
              <i>
                <b style={{ width: `${width}%` }} />
                <small style={{ left: `${(PLAN_PPH / LOAD_RATE_GOAL) * 100}%` }} />
              </i>
            </article>
          );
        })}
      </div>

      {!loading && rows.length === 0 && (
        <div className="empty-state">No outbound load-rate data matches the current filters.</div>
      )}
    </section>
  );
}

export default OutboundLoadRatePanel;
