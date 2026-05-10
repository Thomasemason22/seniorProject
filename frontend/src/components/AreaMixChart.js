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

const colors = [
  '#351c15',
  '#ffb500',
  '#6b3a24',
  '#177245',
  '#3b5f8a',
  '#b42318',
  '#725a49',
  '#d8a742',
];

function AreaMixChart({ data, loading }) {
  const grouped = {};
  const sorts = new Set();

  data.forEach(item => {
    if (!grouped[item.area_group]) {
      grouped[item.area_group] = 0;
    }

    grouped[item.area_group] += item.gross_volume || item.package_volume || 0;
    sorts.add(`${item.date}-${item.shift}`);
  });

  const labels = Object.keys(grouped);
  const total = labels.reduce((sum, label) => sum + grouped[label], 0);
  const sortCount = Math.max(1, sorts.size);
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Area volume',
        data: labels.map(label => grouped[label]),
        backgroundColor: labels.map((_, index) => colors[index % colors.length]),
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '64%',
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
          label: context => {
            const value = Number(context.raw || 0);
            const share = total ? ((value / total) * 100).toFixed(1) : '0.0';
            const avg = value / sortCount;
            return `${context.label}: ${Math.round(avg).toLocaleString()} avg/shift (${share}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="chart-card">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Area mix</p>
          <h3>Volume Share by Area</h3>
        </div>
        <span>{loading ? 'Loading' : `${labels.length} areas`}</span>
      </div>
      <div className="chart-frame compact">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
}

export default AreaMixChart;
