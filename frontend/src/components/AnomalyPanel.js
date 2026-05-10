import React from 'react';

function buildAnomalies(data, kpis) {
  const anomalies = [];
  const sortVolume = kpis.avg_sort_volume || 0;

  if (sortVolume > 300000) {
    anomalies.push({
      title: 'Shift above expected max',
      detail: `${Math.round(sortVolume).toLocaleString()} packages is above the 300k shift ceiling.`,
      tone: 'critical',
    });
  }

  if (sortVolume > 0 && sortVolume < 100000) {
    anomalies.push({
      title: 'Shift volume unusually low',
      detail: `${Math.round(sortVolume).toLocaleString()} packages is below the normal 100k floor.`,
      tone: 'warning',
    });
  }

  data.forEach(item => {
    const gross = item.gross_volume || item.package_volume || 0;
    const scanned = item.scanned_volume || 0;

    if (item.area_group === 'Outbounds' && gross > 12000) {
      anomalies.push({
        title: `${item.belt} high PD volume`,
        detail: `${gross.toLocaleString()} packages is above the 12k PD ceiling.`,
        tone: 'warning',
      });
    }

    if (item.area_group === 'Outbounds' && scanned === 0) {
      anomalies.push({
        title: `${item.belt} missing scans`,
        detail: 'Outbound record has no scanned volume.',
        tone: 'critical',
      });
    }

    if (item.area_group === 'Outbounds' && gross && scanned / gross < 0.78) {
      anomalies.push({
        title: `${item.belt} low scan rate`,
        detail: `${((scanned / gross) * 100).toFixed(1)}% scan rate on ${item.date}.`,
        tone: 'warning',
      });
    }

    if ((item.paid_day || 0) > (item.planned_hours || 0) * 1.45) {
      anomalies.push({
        title: `${item.belt} paid day high`,
        detail: 'Paid day is more than 45% over planned hours.',
        tone: 'warning',
      });
    }
  });

  return anomalies.slice(0, 8);
}

function AnomalyPanel({ data, kpis, loading }) {
  const anomalies = buildAnomalies(data, kpis);

  return (
    <section className="anomaly-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Data mining</p>
          <h3>Anomaly Detection</h3>
        </div>
        <span>{loading ? 'Loading' : `${anomalies.length} flags`}</span>
      </div>

      <div className="anomaly-list">
        {anomalies.length ? anomalies.map(item => (
          <article className={item.tone} key={`${item.title}-${item.detail}`}>
            <strong>{item.title}</strong>
            <p>{item.detail}</p>
          </article>
        )) : (
          <div className="empty-state">No anomalies found in the current filters.</div>
        )}
      </div>
    </section>
  );
}

export default AnomalyPanel;
