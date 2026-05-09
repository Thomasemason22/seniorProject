import React from 'react';

function getOutboundRows(data) {
  const grouped = {};

  data
    .filter(item => item.area_group === 'Outbounds')
    .forEach(item => {
      if (!grouped[item.belt]) {
        grouped[item.belt] = {
          belt: item.belt,
          gross: 0,
          scanned: 0,
          paidDay: 0,
          plannedHours: 0,
          overtime: 0,
          records: 0,
        };
      }

      grouped[item.belt].gross += item.gross_volume || item.package_volume;
      grouped[item.belt].scanned += item.scanned_volume || 0;
      grouped[item.belt].paidDay += item.paid_day || 0;
      grouped[item.belt].plannedHours += item.planned_hours || 0;
      grouped[item.belt].overtime += item.overtime_hours || 0;
      grouped[item.belt].records += 1;
    });

  return Object.values(grouped)
    .map(row => ({
      ...row,
      scanRate: row.gross ? (row.scanned / row.gross) * 100 : 0,
      actualPph: row.paidDay ? row.scanned / row.paidDay : 0,
      plannedPph: row.records ? row.plannedHours / row.records : 0,
    }))
    .sort((a, b) => Number(a.belt.replace('PD ', '')) - Number(b.belt.replace('PD ', '')));
}

function OutboundPerformancePanel({ data, loading }) {
  const rows = getOutboundRows(data);

  return (
    <section className="table-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Outbound belts</p>
          <h3>PD Scan and Gross Volume</h3>
        </div>
        <span>{loading ? 'Loading' : `${rows.length} PD belts`}</span>
      </div>

      <div className="table-wrap compact-table">
        <table>
          <thead>
            <tr>
              <th>Belt</th>
              <th>Scanned</th>
              <th>Gross</th>
              <th>Scan %</th>
              <th>Paid Day</th>
              <th>OT Hours</th>
              <th>Actual PPH</th>
              <th>Planned Hrs</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.belt}>
                <td><span className="tag">{row.belt}</span></td>
                <td>{Math.round(row.scanned).toLocaleString()}</td>
                <td>{Math.round(row.gross).toLocaleString()}</td>
                <td>{row.scanRate.toFixed(1)}%</td>
                <td>{row.paidDay.toFixed(1)}</td>
                <td>{row.overtime.toFixed(1)}</td>
                <td>{Math.round(row.actualPph).toLocaleString()}</td>
                <td>{row.plannedHours.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && rows.length === 0 && (
          <div className="empty-state">No outbound records match the current filters.</div>
        )}
      </div>
    </section>
  );
}

export default OutboundPerformancePanel;
