import React from 'react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

const shiftColors = {
  Day: '#ffb500',
  Twilight: '#6b3a24',
  Midnight: '#177245',
};

function getSortRows(data) {
  const grouped = {};

  data.forEach(item => {
    const key = `${item.date}-${item.shift}`;

    if (!grouped[key]) {
      grouped[key] = {
        date: item.date,
        shift: item.shift,
        volume: 0,
      };
    }

    grouped[key].volume += item.gross_volume || item.package_volume || 0;
  });

  return Object.values(grouped)
    .sort((a, b) => `${a.date} ${a.shift}`.localeCompare(`${b.date} ${b.shift}`))
    .slice(-36);
}

function SortVolumeTrend({ data, loading }) {
  const rows = getSortRows(data);
  const chartData = {
    labels: rows.map(row => `${row.date.slice(5)} ${row.shift.slice(0, 3)}`),
    datasets: [
      {
        label: 'Shift volume',
        type: 'bar',
        data: rows.map(row => row.volume),
        backgroundColor: rows.map(row => shiftColors[row.shift] || '#475569'),
        borderRadius: 6,
      },
      {
        label: '100k normal floor',
        type: 'line',
        data: rows.map(() => 100000),
        borderColor: '#94a3b8',
        borderDash: [5, 5],
        borderWidth: 1,
        pointRadius: 0,
      },
      {
        label: '250k heavy shift',
        type: 'line',
        data: rows.map(() => 250000),
        borderColor: '#f59e0b',
        borderDash: [5, 5],
        borderWidth: 1,
        pointRadius: 0,
      },
      {
        label: '300k max shift',
        type: 'line',
        data: rows.map(() => 300000),
        borderColor: '#dc2626',
        borderDash: [5, 5],
        borderWidth: 1,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
          label: context => `${Math.round(context.raw).toLocaleString()} packages`,
        },
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
          <p className="eyebrow">Shift volume</p>
          <h3>Recent Shifts</h3>
        </div>
        <span>{loading ? 'Loading' : `${rows.length} shifts`}</span>
      </div>
      <div className="chart-frame">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

export default SortVolumeTrend;
