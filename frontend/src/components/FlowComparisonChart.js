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

function FlowComparisonChart({ data, loading }) {
  const grouped = {};

  data.forEach(item => {
    const key = `${item.date}-${item.shift}`;

    if (!grouped[key]) {
      grouped[key] = {
        label: `${item.date.slice(5)} ${item.shift.slice(0, 3)}`,
        unload: 0,
        outbound: 0,
      };
    }

    if (item.area_group === 'Unload') {
      grouped[key].unload += item.gross_volume || item.package_volume || 0;
    }

    if (item.area_group === 'Outbounds') {
      grouped[key].outbound += item.gross_volume || item.package_volume || 0;
    }
  });

  const rows = Object.values(grouped)
    .sort((a, b) => a.label.localeCompare(b.label))
    .slice(-24);
  const chartData = {
    labels: rows.map(row => row.label),
    datasets: [
      {
        label: 'Unload',
        data: rows.map(row => row.unload),
        backgroundColor: '#ffb500',
        borderRadius: 6,
      },
      {
        label: 'Outbounds',
        data: rows.map(row => row.outbound),
        backgroundColor: '#351c15',
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: context => `${context.dataset.label}: ${Math.round(context.raw).toLocaleString()}`,
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
        ticks: {
          callback: value => `${Math.round(value / 1000)}k`,
        },
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
          <p className="eyebrow">Flow balance</p>
          <h3>UL vs PD Volume</h3>
        </div>
        <span>{loading ? 'Loading' : `${rows.length} shifts`}</span>
      </div>
      <div className="chart-frame">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

export default FlowComparisonChart;
