import React from 'react';

function getRiskLevel(data, kpis) {
  if (!data.length) {
    return {
      label: 'No Data',
      className: 'neutral',
      score: 0,
    };
  }

  const highOvertimeCount = data.filter(item => item.overtime_hours >= 6).length;
  const highOvertimeRate = highOvertimeCount / data.length;
  const throughputPressure = (kpis.avg_throughput || 0) > 1000 ? 1 : 0;
  const score = Math.min(100, Math.round((highOvertimeRate * 75) + (throughputPressure * 25)));

  if (score >= 55) {
    return {
      label: 'Elevated',
      className: 'high',
      score,
    };
  }

  if (score >= 25) {
    return {
      label: 'Moderate',
      className: 'medium',
      score,
    };
  }

  return {
    label: 'Stable',
    className: 'low',
    score,
  };
}

function RiskPanel({ data, kpis, loading }) {
  const risk = getRiskLevel(data, kpis);
  const highOvertimeCount = data.filter(item => item.overtime_hours >= 6).length;
  const overtimeRate = data.length ? Math.round((highOvertimeCount / data.length) * 100) : 0;
  const avgVolumePerRecord = data.length
    ? Math.round((kpis.total_volume || 0) / data.length)
    : 0;

  return (
    <div className="risk-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Workload risk</p>
          <h3>Operational Pressure</h3>
        </div>
        <span className={`risk-badge ${risk.className}`}>{loading ? 'Loading' : risk.label}</span>
      </div>

      <div className="risk-meter" aria-label="Risk score">
        <span style={{ width: `${risk.score}%` }} />
      </div>

      <div className="risk-stats">
        <div>
          <span>Risk score</span>
          <strong>{risk.score}</strong>
        </div>
        <div>
          <span>High overtime</span>
          <strong>{overtimeRate}%</strong>
        </div>
        <div>
          <span>Avg volume</span>
          <strong>{avgVolumePerRecord.toLocaleString()}</strong>
        </div>
      </div>
    </div>
  );
}

export default RiskPanel;
