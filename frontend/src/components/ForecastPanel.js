import React from 'react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SHIFT_HOURS = 4;
const DEFAULT_PPH = 265;

function getDateValue(date) {
  return new Date(`${date}T12:00:00`);
}

function getWeekStart(date) {
  const value = getDateValue(date);
  const day = value.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + offset);
  return value.toISOString().slice(0, 10);
}

function getDayName(date) {
  return getDateValue(date).toLocaleDateString('en-US', { weekday: 'short' });
}

function getShiftRank(shift) {
  const normalized = String(shift).toLowerCase();

  if (normalized.includes('twilight')) return 1;
  if (normalized.includes('midnight')) return 2;
  if (normalized.includes('sunrise') || normalized.includes('preload')) return 3;
  if (normalized.includes('day')) return 4;
  if (normalized.includes('night')) return 5;

  return 99;
}

function average(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function aggregateSorts(data) {
  const grouped = {};

  data.forEach(item => {
    const key = `${item.date}-${item.shift}`;

    if (!grouped[key]) {
      grouped[key] = {
        date: item.date,
        shift: item.shift,
        volume: 0,
        scanned: 0,
        staffing: 0,
        paidDay: 0,
        plannedHours: 0,
        records: 0,
      };
    }

    grouped[key].volume += item.gross_volume || item.package_volume || 0;
    grouped[key].scanned += item.scanned_volume || 0;
    grouped[key].staffing += item.staffing_level || 0;
    grouped[key].paidDay += item.paid_day || 0;
    grouped[key].plannedHours += item.planned_hours || 0;
    grouped[key].records += 1;
  });

  return Object.values(grouped).sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    return dateCompare || getShiftRank(a.shift) - getShiftRank(b.shift) || a.shift.localeCompare(b.shift);
  });
}

function predictVolume(history, shift, date) {
  if (!history.length) return 0;

  const recent = history.slice(-8);
  const shiftHistory = history.filter(item => item.shift === shift).slice(-6);
  const dayHistory = history.filter(item => getDayName(item.date) === getDayName(date)).slice(-5);
  const recentAverage = average(recent.map(item => item.volume));
  const shiftAverage = average(shiftHistory.map(item => item.volume)) || recentAverage;
  const dayAverage = average(dayHistory.map(item => item.volume)) || recentAverage;
  const trend =
    recent.length >= 4
      ? average(recent.slice(-3).map(item => item.volume)) - average(recent.slice(0, 3).map(item => item.volume))
      : 0;

  return Math.max(0, (shiftAverage * 0.5) + (recentAverage * 0.3) + (dayAverage * 0.2) + (trend * 0.15));
}

function buildRollingPredictions(sorts) {
  return sorts.map((sort, index) => ({
    ...sort,
    predicted: predictVolume(sorts.slice(0, index), sort.shift, sort.date),
  })).filter(item => item.predicted > 0);
}

function buildUpcomingForecasts(sorts) {
  if (!sorts.length) return [];

  const shiftNames = Array.from(new Set(sorts.map(item => item.shift)))
    .sort((a, b) => getShiftRank(a) - getShiftRank(b) || a.localeCompare(b));
  const latestDate = sorts[sorts.length - 1].date;
  const forecasts = [];
  const cursor = getDateValue(latestDate);

  for (let day = 1; forecasts.length < 6; day += 1) {
    cursor.setDate(cursor.getDate() + 1);
    const forecastDate = cursor.toISOString().slice(0, 10);

    shiftNames.forEach(shift => {
      if (forecasts.length < 6) {
        forecasts.push({
          date: forecastDate,
          shift,
          predicted: predictVolume(sorts, shift, forecastDate),
        });
      }
    });
  }

  return forecasts;
}

function getMetrics(predictions) {
  const errors = predictions.map(item => item.volume - item.predicted);
  const absoluteErrors = errors.map(error => Math.abs(error));
  const percentageErrors = predictions
    .filter(item => item.volume > 0)
    .map(item => Math.abs((item.volume - item.predicted) / item.volume));
  const mae = average(absoluteErrors);
  const mape = average(percentageErrors) * 100;
  const bias = average(errors);
  const accuracy = Math.max(0, 100 - mape);

  return { mae, mape, bias, accuracy };
}

function getDailyHistory(sorts) {
  const grouped = {};

  sorts.forEach(sort => {
    if (!grouped[sort.date]) {
      grouped[sort.date] = 0;
    }

    grouped[sort.date] += sort.volume;
  });

  return Object.entries(grouped)
    .map(([date, volume]) => ({ date, volume }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14);
}

function getWeeklyHistory(sorts) {
  const grouped = {};

  sorts.forEach(sort => {
    const week = getWeekStart(sort.date);

    if (!grouped[week]) {
      grouped[week] = 0;
    }

    grouped[week] += sort.volume;
  });

  return Object.entries(grouped)
    .map(([week, volume]) => ({ week, volume }))
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-8);
}

function formatVolume(value) {
  return Math.round(value).toLocaleString();
}

function ForecastPanel({ data, kpis, loading }) {
  const sorts = aggregateSorts(data);
  const predictions = buildRollingPredictions(sorts);
  const upcoming = buildUpcomingForecasts(sorts);
  const dailyHistory = getDailyHistory(sorts);
  const weeklyHistory = getWeeklyHistory(sorts);
  const metrics = getMetrics(predictions);
  const recentPredictions = predictions.slice(-12);
  const latestForecast = upcoming[0];
  const avgPph = kpis.avg_pph || DEFAULT_PPH;
  const suggestedStaff = latestForecast ? Math.ceil(latestForecast.predicted / avgPph / SHIFT_HOURS) : 0;
  const avgStaff = sorts.length ? Math.round(average(sorts.map(sort => sort.staffing))) : 0;
  const staffingDelta = suggestedStaff - avgStaff;
  const weeklyTotal = weeklyHistory.length ? weeklyHistory[weeklyHistory.length - 1].volume : 0;

  const dailyChartData = {
    labels: dailyHistory.map(item => item.date.slice(5)),
    datasets: [
      {
        label: 'Historical Daily Volume',
        data: dailyHistory.map(item => item.volume),
        backgroundColor: '#3b5f8a',
        borderRadius: 6,
      },
    ],
  };

  const predictionChartData = {
    labels: recentPredictions.map(item => `${item.date.slice(5)} ${item.shift.slice(0, 3)}`),
    datasets: [
      {
        label: 'Actual Volume',
        data: recentPredictions.map(item => item.volume),
        borderColor: '#351c15',
        backgroundColor: 'rgba(53, 28, 21, 0.12)',
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 3,
      },
      {
        label: 'Predicted Volume',
        data: recentPredictions.map(item => item.predicted),
        borderColor: '#ffb500',
        backgroundColor: 'rgba(255, 181, 0, 0.14)',
        borderWidth: 2,
        borderDash: [5, 4],
        tension: 0.35,
        pointRadius: 3,
      },
    ],
  };

  const axisOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
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
        ticks: {
          callback: value => `${Math.round(value / 1000)}k`,
        },
      },
    },
  };

  return (
    <section className="forecast-panel volume-forecast-section" id="volume-forecasting">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Volume forecasting</p>
          <h3>Package Flow Forecast and Labor Plan</h3>
        </div>
        <span>{loading ? 'Loading' : `${sorts.length} historical shifts`}</span>
      </div>

      <div className="forecast-kpi-grid">
        <article>
          <span>Next shift forecast</span>
          <strong>{latestForecast ? formatVolume(latestForecast.predicted) : '0'}</strong>
          <em>{latestForecast ? `${latestForecast.date} ${latestForecast.shift}` : 'Waiting for data'}</em>
        </article>
        <article>
          <span>Staffing recommendation</span>
          <strong>{suggestedStaff}</strong>
          <em>
            {staffingDelta > 0
              ? `Add ${staffingDelta} above recent average`
              : staffingDelta < 0
                ? `${Math.abs(staffingDelta)} under recent average`
                : 'Matches recent average'}
          </em>
        </article>
        <article>
          <span>Model accuracy</span>
          <strong>{metrics.accuracy.toFixed(1)}%</strong>
          <em>{metrics.mape.toFixed(1)}% MAPE</em>
        </article>
        <article>
          <span>Latest weekly volume</span>
          <strong>{formatVolume(weeklyTotal)}</strong>
          <em>{weeklyHistory.length ? `Week of ${weeklyHistory[weeklyHistory.length - 1].week}` : 'No week yet'}</em>
        </article>
      </div>

      <div className="forecast-layout">
        <div className="chart-card forecast-chart">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Historical flow</p>
              <h3>Outbound Volume by Day</h3>
            </div>
          </div>
          <div className="chart-frame compact">
            <Bar data={dailyChartData} options={axisOptions} />
          </div>
        </div>

        <div className="chart-card forecast-chart">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Model check</p>
              <h3>Actual vs Predicted Volume</h3>
            </div>
          </div>
          <div className="chart-frame compact">
            <Line data={predictionChartData} options={axisOptions} />
          </div>
        </div>
      </div>

      <div className="forecast-detail-grid">
        <article className="forecast-table-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Upcoming shifts</p>
              <h3>Forecasted Package Volume</h3>
            </div>
          </div>
          <div className="forecast-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Shift</th>
                  <th>Forecast</th>
                  <th>Staff</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map(item => (
                  <tr key={`${item.date}-${item.shift}`}>
                    <td>{item.date}</td>
                    <td>{item.shift}</td>
                    <td>{formatVolume(item.predicted)}</td>
                    <td>{Math.ceil(item.predicted / avgPph / SHIFT_HOURS)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="forecast-table-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Weekly trend</p>
              <h3>Historical Volume by Week</h3>
            </div>
          </div>
          <div className="weekly-volume-list">
            {weeklyHistory.map(item => (
              <div key={item.week}>
                <span>Week of {item.week}</span>
                <strong>{formatVolume(item.volume)}</strong>
                <i style={{ width: `${Math.min(100, (item.volume / Math.max(weeklyTotal, 1)) * 100)}%` }} />
              </div>
            ))}
          </div>
        </article>

        <article className="forecast-table-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Accuracy metrics</p>
              <h3>Forecast Quality</h3>
            </div>
          </div>
          <dl className="forecast-metrics">
            <div>
              <dt>MAE</dt>
              <dd>{formatVolume(metrics.mae)}</dd>
            </div>
            <div>
              <dt>Bias</dt>
              <dd>{formatVolume(metrics.bias)}</dd>
            </div>
            <div>
              <dt>MAPE</dt>
              <dd>{metrics.mape.toFixed(1)}%</dd>
            </div>
            <div>
              <dt>Samples</dt>
              <dd>{predictions.length}</dd>
            </div>
          </dl>
        </article>

        <article className="forecast-table-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Drivers</p>
              <h3>Factors Affecting Volume</h3>
            </div>
          </div>
          <ul className="forecast-factor-list">
            <li>Recent package flow and short-term trend across the last several shifts.</li>
            <li>Shift pattern, since each sort has different inbound arrival timing and processing load.</li>
            <li>Day-of-week behavior, including weekday business volume and weekend changes.</li>
            <li>Outbound scan rate, staffing coverage, planned hours, and paid-day efficiency.</li>
          </ul>
        </article>
      </div>
    </section>
  );
}

export default ForecastPanel;
