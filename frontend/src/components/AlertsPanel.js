import React from 'react';

function getAlerts(data) {
  const alerts = [];

  data.forEach(item => {
    const gross = item.gross_volume || item.package_volume || 0;
    const scanned = item.scanned_volume || 0;
    const scanRate = gross ? scanned / gross : 1;

    if (scanRate < 0.7) {
      alerts.push(`${item.belt} scan rate is ${(scanRate * 100).toFixed(1)}% on ${item.date}.`);
    }

    if ((item.paid_day || 0) > (item.planned_hours || 0) * 1.35) {
      alerts.push(`${item.belt} paid day is well over planned hours.`);
    }

    if (item.area_group === 'Unload' && gross >= 58000) {
      alerts.push(`${item.belt} unload volume is near the 60k/hr ceiling.`);
    }

    if ((item.overtime_hours || 0) >= 6) {
      alerts.push(`${item.belt} has high overtime exposure.`);
    }
  });

  return Array.from(new Set(alerts)).slice(0, 8);
}

function AlertsPanel({ data }) {
  const alerts = getAlerts(data);

  return (
    <section className="alerts-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Alerts</p>
          <h3>Exceptions to Review</h3>
        </div>
        <span>{alerts.length} flags</span>
      </div>
      <div className="alerts-list">
        {alerts.length ? alerts.map(alert => <p key={alert}>{alert}</p>) : <p>No major exceptions in the current filter.</p>}
      </div>
    </section>
  );
}

export default AlertsPanel;
