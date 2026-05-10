import React from 'react';

import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

import { Scatter } from 'react-chartjs-2';

ChartJS.register(
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const shiftColors = {
  Day: '#ffb500',
  Twilight: '#351c15',
  Midnight: '#177245',
};

function getPoints(data) {
  const grouped = {};

  data.forEach(item => {
    const key = `${item.date}-${item.shift}`;

    if (!grouped[key]) {
      grouped[key] = {
        date: item.date,
        shift: item.shift,
        volume: 0,
        staffing: 0,
        paidDay: 0,
      };
    }

    grouped[key].volume += item.gross_volume || item.package_volume || 0;
    grouped[key].staffing += item.staffing_level || 0;
    grouped[key].paidDay += item.paid_day || 0;
  });

  return Object.values(grouped).map(row => ({
    ...row,
    x: row.staffing,
    y: row.volume,
    pph: row.paidDay ? row.volume / row.paidDay : 0,
  }));
}

function StaffingVolumeScatter({ data, loading }) {
  const points = getPoints(data);
  const shiftTypes = Array.from(new Set(points.map(point => point.shift)));
  const chartData = {
    datasets: shiftTypes.map(shift => ({
      label: shift,
      data: points.filter(point => point.shift === shift),
      backgroundColor: shiftColors[shift] || '#725a49',
      pointRadius: 5,
      pointHoverRadius: 7,
    })),
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
          label: context => {
            const point = context.raw;
            return `${point.date} ${point.shift}: ${point.y.toLocaleString()} pkgs, ${point.x} staff, ${Math.round(point.pph).toLocaleString()} PPH`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Total staffing',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Shift volume',
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
          <p className="eyebrow">Labor model</p>
          <h3>Staffing vs Shift Volume</h3>
        </div>
        <span>{loading ? 'Loading' : `${points.length} shifts`}</span>
      </div>
      <div className="chart-frame">
        <Scatter data={chartData} options={options} />
      </div>
    </div>
  );
}

export default StaffingVolumeScatter;
