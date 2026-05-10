import React from 'react';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

import { Doughnut } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

function ShiftMixChart({ data, loading }) {
  const grouped = {};
  const sortCounts = {};

  data.forEach(item => {
    if (!grouped[item.shift]) {
      grouped[item.shift] = 0;
      sortCounts[item.shift] = new Set();
    }

    grouped[item.shift] += item.package_volume;
    sortCounts[item.shift].add(`${item.date}-${item.shift}`);
  });

  const labels = Object.keys(grouped);
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Average Shift Volume',
        data: labels.map(label => grouped[label] / Math.max(1, sortCounts[label].size)),
        backgroundColor: ['#ffb500', '#351c15', '#177245', '#b42318'],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: context => `${context.label}: ${Math.round(context.raw).toLocaleString()} avg packages`,
        },
      },
    },
  };

  return (
    <div className="chart-card">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Shift mix</p>
          <h3>Avg Shift Volume</h3>
        </div>
        <span>{loading ? 'Loading' : `${labels.length} shifts`}</span>
      </div>
      <div className="chart-frame compact">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
}

export default ShiftMixChart;
