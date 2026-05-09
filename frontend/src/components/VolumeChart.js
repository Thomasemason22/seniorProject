import React from 'react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function VolumeChart({ data, loading }) {
  const sortedData = [...data]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-30);
  const labels = sortedData.map(item => item.date);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Gross Volume',
        data: sortedData.map(item => item.gross_volume || item.package_volume),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.12)',
        borderWidth: 2,
        fill: true,
        tension: 0.35,
        pointRadius: 2,
      },
      {
        label: 'Outbound Scanned Volume',
        data: sortedData.map(item => item.scanned_volume || 0),
        borderColor: '#0f766e',
        backgroundColor: 'rgba(15, 118, 110, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.35,
        pointRadius: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
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
          <p className="eyebrow">Daily flow</p>
          <h3>Gross Flow vs Outbound Scans</h3>
        </div>
        <span>{loading ? 'Loading' : `${sortedData.length} days`}</span>
      </div>
      <div className="chart-frame">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

export default VolumeChart;
