import React from 'react';

function DailyReportPanel({ data, kpis }) {
  const scanRate = kpis.outbound_gross_volume ? (kpis.total_scanned / kpis.outbound_gross_volume) * 100 : 0;
  const variance = (kpis.total_paid_day || 0) - (kpis.planned_hours || 0);

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
        <div><span>Gross volume</span><strong>{Math.round(kpis.total_volume || 0).toLocaleString()}</strong></div>
        <div><span>Outbound scanned</span><strong>{Math.round(kpis.total_scanned || 0).toLocaleString()}</strong></div>
        <div><span>Outbound scan rate</span><strong>{scanRate.toFixed(1)}%</strong></div>
        <div><span>Planned hours</span><strong>{Math.round(kpis.planned_hours || 0).toLocaleString()}</strong></div>
        <div><span>Actual paid day</span><strong>{Math.round(kpis.total_paid_day || 0).toLocaleString()}</strong></div>
        <div><span>Paid variance</span><strong>{Math.round(variance).toLocaleString()}</strong></div>
      </div>
    </section>
  );
}

export default DailyReportPanel;
