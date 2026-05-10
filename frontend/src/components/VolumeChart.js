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
  const grouped = {};

  data.forEach(item => {
    const key = `${item.date}-${item.shift}`;

    if (!grouped[key]) {
      grouped[key] = {
        date: item.date,
        shift: item.shift,
        gross: 0,
        scanned: 0,
      };
    }

    grouped[key].gross += item.gross_volume || item.package_volume || 0;
    grouped[key].scanned += item.scanned_volume || 0;
  });

  const sortedData = Object.values(grouped)
    .sort((a, b) => `${a.date} ${a.shift}`.localeCompare(`${b.date} ${b.shift}`))
    .slice(-30);
  const labels = sortedData.map(item => `${item.date.slice(5)} ${item.shift.slice(0, 3)}`);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Shift Gross Volume',
        data: sortedData.map(item => item.gross),
        borderColor: '#351c15',
        backgroundColor: 'rgba(53, 28, 21, 0.12)',
        borderWidth: 2,
        fill: true,
        tension: 0.35,
        pointRadius: 2,
      },
      {
        label: 'Outbound Scanned Volume',
        data: sortedData.map(item => item.scanned),
        borderColor: '#ffb500',
        backgroundColor: 'rgba(255, 181, 0, 0.18)',
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
        suggestedMax: 300000,
        border: {
          display: false,
        },
        ticks: {
          callback: value => `${Math.round(value / 1000)}k`,
        },
      },
    },
  };

  return (
    <div className="chart-card">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Daily flow</p>
          <h3>Shift Volume vs Outbound Scans</h3>
        </div>
        <span>{loading ? 'Loading' : `${sortedData.length} shifts`}</span>
      </div>
      <div className="chart-frame">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

export default VolumeChart;
