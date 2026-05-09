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

  data.forEach(item => {
    if (!grouped[item.shift]) {
      grouped[item.shift] = 0;
    }

    grouped[item.shift] += item.package_volume;
  });

  const labels = Object.keys(grouped);
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Volume Share',
        data: labels.map(label => grouped[label]),
        backgroundColor: ['#2563eb', '#0f766e', '#f59e0b', '#dc2626'],
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
    },
  };

  return (
    <div className="chart-card">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Shift mix</p>
          <h3>Volume Share by Shift</h3>
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
