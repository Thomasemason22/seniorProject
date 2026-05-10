import React from 'react';

const MAX_PACKAGES_PER_HOUR = 60000;

function getSortTotals(data) {
  const grouped = {};

  data.forEach(item => {
    const key = `${item.date}-${item.shift}`;

    if (!grouped[key]) {
      grouped[key] = {
        date: item.date,
        shift: item.shift,
        volume: 0,
      };
    }

    grouped[key].volume += item.gross_volume || item.package_volume || 0;
  });

  return Object.values(grouped);
}

function CapacityAnalysisPanel({ data, loading }) {
  const sorts = getSortTotals(data);
  const volumes = sorts.map(sort => sort.volume);
  const avgSort = volumes.length
    ? volumes.reduce((sum, volume) => sum + volume, 0) / volumes.length
    : 0;
  const peakSort = volumes.length ? Math.max(...volumes) : 0;
  const impliedHours = avgSort / MAX_PACKAGES_PER_HOUR;
  const peakImpliedHours = peakSort / MAX_PACKAGES_PER_HOUR;
  const highVolumeSorts = sorts.filter(sort => sort.volume >= 250000).length;
  const highVolumeRate = sorts.length ? (highVolumeSorts / sorts.length) * 100 : 0;

  return (
    <section className="capacity-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Capacity analysis</p>
          <h3>Shift Load vs 60k/hr Ceiling</h3>
        </div>
        <span>{loading ? 'Loading' : `${sorts.length} shifts`}</span>
      </div>

      <div className="capacity-stats">
        <div>
          <span>Avg shift</span>
          <strong>{Math.round(avgSort).toLocaleString()}</strong>
          <i style={{ width: `${Math.min(100, (avgSort / 300000) * 100)}%` }} />
        </div>
        <div>
          <span>Peak shift</span>
          <strong>{Math.round(peakSort).toLocaleString()}</strong>
          <i style={{ width: `${Math.min(100, (peakSort / 300000) * 100)}%` }} />
        </div>
        <div>
          <span>Avg implied hrs</span>
          <strong>{impliedHours.toFixed(1)}</strong>
          <i style={{ width: `${Math.min(100, (impliedHours / 5) * 100)}%` }} />
        </div>
        <div>
          <span>Peak implied hrs</span>
          <strong>{peakImpliedHours.toFixed(1)}</strong>
          <i style={{ width: `${Math.min(100, (peakImpliedHours / 5) * 100)}%` }} />
        </div>
        <div>
          <span>250k+ shifts</span>
          <strong>{highVolumeRate.toFixed(0)}%</strong>
          <i style={{ width: `${Math.min(100, highVolumeRate)}%` }} />
        </div>
      </div>
    </section>
  );
}

export default CapacityAnalysisPanel;
