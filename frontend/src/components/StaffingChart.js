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

function StaffingChart({ data }) {
  const grouped = {};
  const counts = {};

  data.forEach(item => {
    if (!grouped[item.shift]) {
      grouped[item.shift] = 0;
      counts[item.shift] = 0;
    }

    grouped[item.shift] += item.staffing_level;
    counts[item.shift] += 1;
  });

  const labels = Object.keys(grouped);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Average Staffing',
        data: labels.map(shift => Math.round(grouped[shift] / counts[shift])),
        backgroundColor: ['#ffb500', '#351c15', '#177245', '#b42318'],
        borderRadius: 6,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        border: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="chart-card">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Labor coverage</p>
          <h3>Average Staffing by Shift</h3>
        </div>
      </div>
      <div className="chart-frame">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

export default StaffingChart;
