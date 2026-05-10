import React from 'react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function AreaPerformanceChart({ data, loading }) {
  const grouped = {};
  const sorts = new Set();

  data.forEach(item => {
    if (!grouped[item.area_group]) {
      grouped[item.area_group] = 0;
    }

    grouped[item.area_group] += item.gross_volume || item.package_volume;
    sorts.add(`${item.date}-${item.shift}`);
  });

  const labels = Object.keys(grouped);
  const sortCount = Math.max(1, sorts.size);
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Average Shift Volume by Area Group',
        data: labels.map(label => grouped[label] / sortCount),
        backgroundColor: '#6b3a24',
        borderRadius: 6,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          callback: value => `${Math.round(value / 1000)}k`,
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="chart-card">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Area performance</p>
          <h3>Avg Shift Volume by Area</h3>
        </div>
        <span>{loading ? 'Loading' : `${labels.length} areas`}</span>
      </div>
      <div className="chart-frame">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

export default AreaPerformanceChart;
