import React from 'react';

function OperationsTable({ data, loading }) {
  const rows = [...data]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 12);

  return (
    <section className="table-panel" id="records">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Recent activity</p>
          <h3>Operations Records</h3>
        </div>
        <span>{loading ? 'Loading' : `${data.length.toLocaleString()} filtered`}</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Shift</th>
              <th>Group</th>
              <th>Area</th>
              <th>Scanned</th>
              <th>Gross</th>
              <th>Hours</th>
              <th>Paid Day</th>
              <th>Staff</th>
              <th>PPH</th>
              <th>OT</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id}>
                <td>{row.date}</td>
                <td><span className="tag">{row.shift}</span></td>
                <td>{row.area_group}</td>
                <td>{row.outbound_area}</td>
                <td>{(row.scanned_volume || 0).toLocaleString()}</td>
                <td>{(row.gross_volume || row.package_volume).toLocaleString()}</td>
                <td>{(row.hours || 0).toFixed(1)}</td>
                <td>{(row.paid_day || 0).toFixed(1)}</td>
                <td>{row.staffing_level}</td>
                <td>{Math.round(row.actual_pph || row.throughput).toLocaleString()}</td>
                <td>{row.overtime_hours.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && rows.length === 0 && (
          <div className="empty-state">No records match the current filters.</div>
        )}
      </div>
    </section>
  );
}

export default OperationsTable;
