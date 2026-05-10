import React from 'react';

function getRecommendations(data, kpis) {
  if (!data.length) {
    return [
      {
        title: 'No matching records',
        detail: 'Adjust filters or seed the database to generate recommendations.',
        tone: 'neutral',
      },
    ];
  }

  const highOvertimeRows = data.filter(item => item.overtime_hours >= 6);
  const overtimeRate = highOvertimeRows.length / data.length;
  const avgThroughput = kpis.avg_throughput || 0;
  const avgStaffing = kpis.avg_staffing || 0;
  const peakVolume = kpis.peak_volume || 0;

  const recommendations = [];

  if (overtimeRate > 0.25) {
    recommendations.push({
      title: 'Add flex coverage to high-overtime shifts',
      detail: `${Math.round(overtimeRate * 100)}% of filtered records are at 6+ overtime hours.`,
      tone: 'warning',
    });
  } else {
    recommendations.push({
      title: 'Overtime profile is controlled',
      detail: 'Current filters show limited high-overtime exposure.',
      tone: 'positive',
    });
  }

  if (avgThroughput > 1000) {
    recommendations.push({
      title: 'Investigate throughput pressure',
      detail: `Average throughput is ${Math.round(avgThroughput).toLocaleString()} packages per staff member.`,
      tone: 'warning',
    });
  }

  if (avgStaffing < 14 && peakVolume > 250000) {
    recommendations.push({
      title: 'Review staffing floor',
      detail: 'Peak shift volume is above 250k while average staffing is comparatively low.',
      tone: 'warning',
    });
  }

  recommendations.push({
    title: 'Use area rankings for daily standup',
    detail: 'Compare top volume areas against overtime to rebalance work before the next shift.',
    tone: 'neutral',
  });

  return recommendations.slice(0, 4);
}

function RecommendationsPanel({ data, kpis, loading }) {
  const recommendations = getRecommendations(data, kpis);

  return (
    <section className="recommendations-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Decision support</p>
          <h3>Recommended Actions</h3>
        </div>
        <span>{loading ? 'Loading' : `${recommendations.length} actions`}</span>
      </div>

      <div className="recommendation-grid">
        {recommendations.map(item => (
          <article className={`recommendation-card ${item.tone}`} key={item.title}>
            <strong>{item.title}</strong>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default RecommendationsPanel;
