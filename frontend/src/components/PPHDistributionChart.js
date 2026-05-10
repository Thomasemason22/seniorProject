import React from 'react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

const buckets = [
  { label: '<200', min: 0, max: 200 },
  { label: '200-264', min: 200, max: 265 },
  { label: '265-399', min: 265, max: 400 },
  { label: '400-499', min: 400, max: 500 },
  { label: '500+', min: 500, max: Infinity },
];

function getLoadRates(data) {
  return data
    .filter(item => item.area_group === 'Outbounds' && (item.paid_day || 0) > 0)
    .map(item => (item.scanned_volume || 0) / item.paid_day);
}

function PPHDistributionChart({ data, loading }) {
  const rates = getLoadRates(data);
  const counts = buckets.map(bucket => rates.filter(rate => rate >= bucket.min && rate < bucket.max).length);
  const chartData = {
    labels: buckets.map(bucket => bucket.label),
    datasets: [
      {
        label: 'PD records',
        data: counts,
        backgroundColor: ['#b42318', '#d97706', '#ffb500', '#177245', '#351c15'],
        borderRadius: 6,
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
          <p className="eyebrow">PPH distribution</p>
          <h3>Outbound Load Rate Buckets</h3>
        </div>
        <span>{loading ? 'Loading' : `${rates.length} PD records`}</span>
      </div>
      <div className="chart-frame compact">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

export default PPHDistributionChart;
