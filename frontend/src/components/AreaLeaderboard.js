import React from 'react';

function AreaLeaderboard({ data, loading, selectedArea, onSelectArea }) {
  const grouped = {};

  data.forEach(item => {
    const shiftKey = `${item.date}-${item.shift}`;

    if (!grouped[item.outbound_area]) {
      grouped[item.outbound_area] = {
        volume: 0,
        overtime: 0,
        records: 0,
        shiftKeys: new Set(),
      };
    }

    grouped[item.outbound_area].volume += item.gross_volume || item.package_volume || 0;
    grouped[item.outbound_area].overtime += item.overtime_hours || 0;
    grouped[item.outbound_area].records += 1;
    grouped[item.outbound_area].shiftKeys.add(shiftKey);
  });

  const rows = Object.entries(grouped)
    .map(([area, values]) => {
      const shiftCount = Math.max(1, values.shiftKeys.size);

      return {
        area,
        volume: values.volume,
        records: values.records,
        shiftCount,
        avgVolume: values.volume / shiftCount,
        avgOvertime: values.overtime / values.records,
      };
    })
    .sort((a, b) => b.avgVolume - a.avgVolume)
    .slice(0, 5);

  const maxVolume = rows.length ? rows[0].avgVolume : 1;

  return (
    <div className="leaderboard-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Area ranking</p>
          <h3>Top Avg Shift Volume Areas</h3>
        </div>
        <span>{loading ? 'Loading' : `${rows.length} shown`}</span>
      </div>

      <div className="leaderboard-list">
        {rows.map(row => (
          <button
            className={`leaderboard-row ${selectedArea === row.area ? 'selected' : ''}`}
            key={row.area}
            type="button"
            onClick={() => onSelectArea(row.area)}
          >
            <div>
              <strong>{row.area}</strong>
              <span>{row.shiftCount} shifts · {row.avgOvertime.toFixed(1)} avg OT</span>
            </div>
            <em>{Math.round(row.avgVolume).toLocaleString()}</em>
            <i style={{ width: `${(row.avgVolume / maxVolume) * 100}%` }} />
          </button>
        ))}
      </div>

      {!loading && rows.length === 0 && (
        <div className="empty-state">No area data available.</div>
      )}
    </div>
  );
}

export default AreaLeaderboard;
