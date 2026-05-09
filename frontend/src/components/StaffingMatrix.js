import React from 'react';

function getStaffingRows(data) {
  const grouped = {};

  data.forEach(item => {
    const key = `${item.area_group}-${item.belt}`;

    if (!grouped[key]) {
      grouped[key] = {
        group: item.area_group,
        belt: item.belt,
        staffing: 0,
        plannedHours: 0,
        gross: 0,
        paidDay: 0,
        records: 0,
      };
    }

    grouped[key].staffing += item.staffing_level;
    grouped[key].plannedHours += item.planned_hours || 0;
    grouped[key].gross += item.gross_volume || item.package_volume;
    grouped[key].paidDay += item.paid_day || 0;
    grouped[key].records += 1;
  });

  return Object.values(grouped)
    .map(row => ({
      ...row,
      avgStaffing: row.staffing / row.records,
      avgPlannedHours: row.plannedHours / row.records,
      avgPaidDay: row.paidDay / row.records,
    }))
    .sort((a, b) => a.group.localeCompare(b.group) || a.belt.localeCompare(b.belt))
    .slice(0, 24);
}

function getCoverageClass(row) {
  if (row.avgPaidDay < row.avgPlannedHours * 0.85) {
    return 'under';
  }

  if (row.avgPaidDay > row.avgPlannedHours * 1.25) {
    return 'over';
  }

  return 'balanced';
}

function StaffingMatrix({ data, loading }) {
  const rows = getStaffingRows(data);

  return (
    <section className="staffing-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Staffing check</p>
          <h3>Belt Coverage Matrix</h3>
        </div>
        <span>{loading ? 'Loading' : `${rows.length} belts`}</span>
      </div>

      <div className="staffing-grid">
        {rows.map(row => (
          <article className={`staffing-card ${getCoverageClass(row)}`} key={`${row.group}-${row.belt}`}>
            <div>
              <strong>{row.belt}</strong>
              <span>{row.group}</span>
            </div>
            <dl>
              <div>
                <dt>Avg staff</dt>
                <dd>{row.avgStaffing.toFixed(1)}</dd>
              </div>
              <div>
                <dt>Planned hrs</dt>
                <dd>{row.avgPlannedHours.toFixed(1)}</dd>
              </div>
              <div>
                <dt>Paid day</dt>
                <dd>{row.avgPaidDay.toFixed(1)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      {!loading && rows.length === 0 && (
        <div className="empty-state">No staffing records match the current filters.</div>
      )}
    </section>
  );
}

export default StaffingMatrix;
