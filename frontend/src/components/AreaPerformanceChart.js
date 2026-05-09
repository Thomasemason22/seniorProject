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

  data.forEach(item => {
    if (!grouped[item.area_group]) {
      grouped[item.area_group] = 0;
    }

    grouped[item.area_group] += item.gross_volume || item.package_volume;
  });

  const labels = Object.keys(grouped);
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Gross Volume by Area Group',
        data: labels.map(label => grouped[label]),
        backgroundColor: '#475569',
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
          <h3>Volume by Area Group</h3>
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
