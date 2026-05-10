import React from 'react';

const SCENARIOS = [200000, 250000, 300000];
const TARGET_PPH = 265;
const SHIFT_HOURS = 4;

function ForecastPanel({ data, kpis, loading }) {
  const avgPaidPerPackage = kpis.total_volume
    ? kpis.total_paid_day / kpis.total_volume
    : 1 / TARGET_PPH;
  const currentVolume = kpis.avg_sort_volume || 0;
  const predictedPaidDay = currentVolume * avgPaidPerPackage;
  const currentStaffNeed = Math.ceil(predictedPaidDay / SHIFT_HOURS);
  const pressure = currentVolume >= 275000 ? 'High' : currentVolume >= 225000 ? 'Moderate' : 'Stable';

  return (
    <section className="forecast-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Prediction</p>
          <h3>Staffing and Paid Day Forecast</h3>
        </div>
        <span>{loading ? 'Loading' : `${data.length.toLocaleString()} records`}</span>
      </div>

      <div className="forecast-current">
        <div>
          <span>Predicted paid day</span>
          <strong>{Math.round(predictedPaidDay).toLocaleString()}</strong>
        </div>
        <div>
          <span>Suggested staff</span>
          <strong>{currentStaffNeed || 0}</strong>
        </div>
        <div>
          <span>Risk level</span>
          <strong>{pressure}</strong>
        </div>
      </div>

      <div className="scenario-list">
        {SCENARIOS.map(volume => {
          const paidDay = volume * avgPaidPerPackage;
          const staff = Math.ceil(paidDay / SHIFT_HOURS);

          return (
            <article key={volume}>
              <span>{volume.toLocaleString()} shift</span>
              <strong>{staff} staff</strong>
              <em>{Math.round(paidDay).toLocaleString()} paid day</em>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default ForecastPanel;
