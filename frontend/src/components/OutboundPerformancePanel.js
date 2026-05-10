import React from 'react';

function getOutboundRows(data) {
  const grouped = {};

  data
    .filter(item => item.area_group === 'Outbounds')
    .forEach(item => {
      const shiftKey = `${item.date}-${item.shift}`;

      if (!grouped[item.belt]) {
        grouped[item.belt] = {
          belt: item.belt,
          gross: 0,
          scanned: 0,
          paidDay: 0,
          plannedHours: 0,
          overtime: 0,
          records: 0,
          shiftKeys: new Set(),
        };
      }

      grouped[item.belt].gross += item.gross_volume || item.package_volume || 0;
      grouped[item.belt].scanned += item.scanned_volume || 0;
      grouped[item.belt].paidDay += item.paid_day || 0;
      grouped[item.belt].plannedHours += item.planned_hours || 0;
      grouped[item.belt].overtime += item.overtime_hours || 0;
      grouped[item.belt].records += 1;
      grouped[item.belt].shiftKeys.add(shiftKey);
    });

  return Object.values(grouped)
    .map(row => {
      const shiftCount = Math.max(1, row.shiftKeys.size);

      return {
        ...row,
        shiftCount,
        avgGross: row.gross / shiftCount,
        avgScanned: row.scanned / shiftCount,
        avgPaidDay: row.paidDay / shiftCount,
        avgPlannedHours: row.plannedHours / shiftCount,
        avgOvertime: row.overtime / shiftCount,
        scanRate: row.gross ? (row.scanned / row.gross) * 100 : 0,
        actualPph: row.paidDay ? row.scanned / row.paidDay : 0,
        plannedPph: 265,
      };
    })
    .sort((a, b) => Number(a.belt.replace('PD ', '')) - Number(b.belt.replace('PD ', '')));
}

function OutboundPerformancePanel({ data, loading }) {
  const rows = getOutboundRows(data);

  return (
    <section className="table-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Outbound belts</p>
          <h3>PD Avg Shift Scan and Gross</h3>
        </div>
        <span>{loading ? 'Loading' : `${rows.length} PD belts`}</span>
      </div>

      <div className="table-wrap compact-table">
        <table>
          <thead>
            <tr>
              <th>Belt</th>
              <th>Avg Scanned</th>
              <th>Avg Gross</th>
              <th>Scan %</th>
              <th>Avg Paid</th>
              <th>Avg OT</th>
              <th>Actual PPH</th>
              <th>Plan PPH</th>
              <th>Avg Plan Hrs</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.belt}>
                <td><span className="tag">{row.belt}</span></td>
                <td>{Math.round(row.avgScanned).toLocaleString()}</td>
                <td>{Math.round(row.avgGross).toLocaleString()}</td>
                <td>{row.scanRate.toFixed(1)}%</td>
                <td>{row.avgPaidDay.toFixed(1)}</td>
                <td>{row.avgOvertime.toFixed(1)}</td>
                <td>{Math.round(row.actualPph).toLocaleString()}</td>
                <td>{row.plannedPph}</td>
                <td>{row.avgPlannedHours.toFixed(1)}</td>
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
