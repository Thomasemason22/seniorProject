import React from 'react';

function getRows(data) {
  const grouped = {};

  data.forEach(item => {
    if (!grouped[item.area_group]) {
      grouped[item.area_group] = {
        group: item.area_group,
        volume: 0,
        paidDay: 0,
        plannedHours: 0,
        overtime: 0,
        records: 0,
      };
    }

    grouped[item.area_group].volume += item.gross_volume || item.package_volume || 0;
    grouped[item.area_group].paidDay += item.paid_day || 0;
    grouped[item.area_group].plannedHours += item.planned_hours || 0;
    grouped[item.area_group].overtime += item.overtime_hours || 0;
    grouped[item.area_group].records += 1;
  });

  const totalVolume = Object.values(grouped).reduce((sum, row) => sum + row.volume, 0);

  return Object.values(grouped)
    .map(row => ({
      ...row,
      pph: row.paidDay ? row.volume / row.paidDay : 0,
      variance: row.paidDay - row.plannedHours,
      volumeShare: totalVolume ? (row.volume / totalVolume) * 100 : 0,
    }))
    .sort((a, b) => b.volume - a.volume);
}

function AreaEfficiencyPanel({ data, loading }) {
  const rows = getRows(data);

  return (
    <section className="efficiency-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Area efficiency</p>
          <h3>PPH and Paid Variance</h3>
        </div>
        <span>{loading ? 'Loading' : `${rows.length} areas`}</span>
      </div>

      <div className="efficiency-list">
        {rows.map(row => (
          <article key={row.group}>
            <div>
              <strong>{row.group}</strong>
              <span>{row.volumeShare.toFixed(1)}% of volume</span>
            </div>
            <dl>
              <div><dt>PPH</dt><dd>{Math.round(row.pph).toLocaleString()}</dd></div>
              <div><dt>Paid variance</dt><dd>{Math.round(row.variance).toLocaleString()}</dd></div>
              <div><dt>OT</dt><dd>{row.overtime.toFixed(1)}</dd></div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

export default AreaEfficiencyPanel;
