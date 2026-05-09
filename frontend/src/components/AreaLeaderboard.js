import React from 'react';

function AreaLeaderboard({ data, loading }) {
  const grouped = {};

  data.forEach(item => {
    if (!grouped[item.outbound_area]) {
      grouped[item.outbound_area] = {
        volume: 0,
        overtime: 0,
        records: 0,
      };
    }

    grouped[item.outbound_area].volume += item.gross_volume || item.package_volume;
    grouped[item.outbound_area].overtime += item.overtime_hours;
    grouped[item.outbound_area].records += 1;
  });

  const rows = Object.entries(grouped)
    .map(([area, values]) => ({
      area,
      ...values,
      avgOvertime: values.overtime / values.records,
    }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5);

  const maxVolume = rows.length ? rows[0].volume : 1;

  return (
    <div className="leaderboard-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Area ranking</p>
          <h3>Top Volume Areas</h3>
        </div>
        <span>{loading ? 'Loading' : `${rows.length} shown`}</span>
      </div>

      <div className="leaderboard-list">
        {rows.map(row => (
          <div className="leaderboard-row" key={row.area}>
            <div>
              <strong>{row.area}</strong>
              <span>{row.records} records · {row.avgOvertime.toFixed(1)} avg OT</span>
            </div>
            <em>{row.volume.toLocaleString()}</em>
            <i style={{ width: `${(row.volume / maxVolume) * 100}%` }} />
          </div>
        ))}
      </div>

      {!loading && rows.length === 0 && (
        <div className="empty-state">No area data available.</div>
      )}
    </div>
  );
}

export default AreaLeaderboard;
