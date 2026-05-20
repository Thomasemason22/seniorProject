import React from 'react';

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';

import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function getUtilizationStatus(utilization) {
  if (utilization >= 95) return 'over';
  if (utilization >= 85) return 'healthy';
  if (utilization >= 70) return 'watch';
  return 'low';
}

function getSummary(records) {
  const totalPackages = records.reduce((sum, record) => sum + (record.package_count || 0), 0);
  const totalUsedCube = records.reduce((sum, record) => sum + (record.used_cube || 0), 0);
  const totalCapacity = records.reduce((sum, record) => sum + (record.trailer_capacity || 0), 0);
  const avgUtilization = totalCapacity ? (totalUsedCube / totalCapacity) * 100 : 0;
  const underutilized = records.filter(record => record.cube_utilization < 70).length;
  const nearCapacity = records.filter(record => record.cube_utilization >= 95).length;

  return { totalPackages, totalUsedCube, totalCapacity, avgUtilization, underutilized, nearCapacity };
}

function TrailerCubePanel({ records, loading }) {
  const summary = getSummary(records);
  const sortedRecords = [...records]
    .sort((a, b) => (b.cube_utilization || 0) - (a.cube_utilization || 0));
  const chartRecords = sortedRecords.slice(0, 12);
  const chartData = {
    labels: chartRecords.map(record => record.trailer_id || record.destination || `Trailer ${record.id}`),
    datasets: [
      {
        label: 'Cube Utilization %',
        data: chartRecords.map(record => record.cube_utilization || 0),
        backgroundColor: chartRecords.map(record => {
          const status = getUtilizationStatus(record.cube_utilization || 0);
          if (status === 'over') return '#b42318';
          if (status === 'healthy') return '#177245';
          if (status === 'watch') return '#ffb500';
          return '#3b5f8a';
        }),
        borderRadius: 6,
      },
    ],
  };
  const chartOptions = {
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
        suggestedMax: 100,
        border: {
          display: false,
        },
        ticks: {
          callback: value => `${value}%`,
        },
      },
    },
  };

  return (
    <section className="trailer-cube-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Trailer cube</p>
          <h3>Trailer Cube Utilization</h3>
        </div>
        <span>{loading ? 'Loading' : `${records.length} trailers`}</span>
      </div>

      <div className="cube-kpi-grid">
        <article><span>Avg cube</span><strong>{summary.avgUtilization.toFixed(1)}%</strong></article>
        <article><span>Used cube</span><strong>{Math.round(summary.totalUsedCube).toLocaleString()}</strong></article>
        <article><span>Capacity</span><strong>{Math.round(summary.totalCapacity).toLocaleString()}</strong></article>
        <article><span>Packages</span><strong>{summary.totalPackages.toLocaleString()}</strong></article>
        <article><span>Under 70%</span><strong>{summary.underutilized}</strong></article>
        <article><span>95%+</span><strong>{summary.nearCapacity}</strong></article>
      </div>

      <section className="chart-card cube-chart-card">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Top trailers</p>
            <h3>Cube Percent by Trailer</h3>
          </div>
        </div>
        <div className="chart-frame compact">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </section>

      <div className="table-panel cube-table-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Load plan</p>
            <h3>Trailer Records</h3>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Shift</th>
                <th>Trailer</th>
                <th>Destination</th>
                <th>PD</th>
                <th>Belt</th>
                <th>Packages</th>
                <th>Used Cube</th>
                <th>Capacity</th>
                <th>Cube %</th>
                <th>Quality</th>
              </tr>
            </thead>
            <tbody>
              {sortedRecords.slice(0, 18).map(record => (
                <tr key={record.id}>
                  <td>{record.date}</td>
                  <td><span className="tag">{record.shift}</span></td>
                  <td>{record.trailer_id}</td>
                  <td>{record.destination}</td>
                  <td>{record.pd || '-'}</td>
                  <td>{record.belt || '-'}</td>
                  <td>{(record.package_count || 0).toLocaleString()}</td>
                  <td>{Math.round(record.used_cube || 0).toLocaleString()}</td>
                  <td>{Math.round(record.trailer_capacity || 0).toLocaleString()}</td>
                  <td><span className={`cube-status ${getUtilizationStatus(record.cube_utilization || 0)}`}>{(record.cube_utilization || 0).toFixed(1)}%</span></td>
                  <td>{record.load_quality || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && records.length === 0 && (
            <div className="empty-state">Upload trailer cube CSVs in the Import Center to populate this page.</div>
          )}
        </div>
      </div>
    </section>
  );
}

export default TrailerCubePanel;
