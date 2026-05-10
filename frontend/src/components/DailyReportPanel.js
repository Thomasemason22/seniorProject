import React from 'react';

function DailyReportPanel({ data, kpis }) {
  const scanRate = kpis.outbound_gross_volume ? (kpis.total_scanned / kpis.outbound_gross_volume) * 100 : 0;
  const sortCount = Math.max(1, kpis.sort_count || 0);
  const avgScanned = (kpis.total_scanned || 0) / sortCount;
  const avgPlannedHours = (kpis.planned_hours || 0) / sortCount;
  const avgPaidDay = (kpis.total_paid_day || 0) / sortCount;
  const variance = avgPaidDay - avgPlannedHours;
  const avgSortVolume = kpis.avg_sort_volume || 0;
  const peakSortVolume = kpis.peak_sort_volume || 0;

  return (
    <section className="report-panel" id="report">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Daily shift report</p>
          <h3>Plan vs Actual Summary</h3>
        </div>
        <span>{data.length.toLocaleString()} records</span>
      </div>

      <div className="report-grid">
        <div><span>Avg shift volume</span><strong>{Math.round(avgSortVolume).toLocaleString()}</strong></div>
        <div><span>Peak shift volume</span><strong>{Math.round(peakSortVolume).toLocaleString()}</strong></div>
        <div><span>Avg outbound scanned</span><strong>{Math.round(avgScanned).toLocaleString()}</strong></div>
        <div><span>Outbound scan rate</span><strong>{scanRate.toFixed(1)}%</strong></div>
        <div><span>Avg planned hours</span><strong>{Math.round(avgPlannedHours).toLocaleString()}</strong></div>
        <div><span>Avg paid day</span><strong>{Math.round(avgPaidDay).toLocaleString()}</strong></div>
        <div><span>Paid variance</span><strong>{Math.round(variance).toLocaleString()}</strong></div>
      </div>
    </section>
  );
}

export default DailyReportPanel;
