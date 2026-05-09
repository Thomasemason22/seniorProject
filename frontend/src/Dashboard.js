import React, { useEffect, useState } from 'react';
import axios from 'axios';

import KPIcards from './components/KPIcards';
import VolumeChart from './components/VolumeChart';
import StaffingChart from './components/StaffingChart';
import AreaPerformanceChart from './components/AreaPerformanceChart';
import OperationsTable from './components/OperationsTable';
import ShiftMixChart from './components/ShiftMixChart';
import RiskPanel from './components/RiskPanel';
import AreaLeaderboard from './components/AreaLeaderboard';
import RecommendationsPanel from './components/RecommendationsPanel';
import OutboundPerformancePanel from './components/OutboundPerformancePanel';
import StaffingMatrix from './components/StaffingMatrix';

const API_BASE_URL = 'http://127.0.0.1:5000';

function getUniqueValues(data, key) {
  return Array.from(new Set(data.map(item => item[key]))).sort();
}

function getSummary(data) {
  if (!data.length) {
    return {
      total_volume: 0,
      avg_throughput: 0,
      avg_staffing: 0,
      total_overtime: 0,
      total_scanned: 0,
      total_paid_day: 0,
      avg_pph: 0,
      planned_hours: 0,
      records: 0,
      peak_volume: 0,
    };
  }

  const totalVolume = data.reduce((sum, item) => sum + item.package_volume, 0);
  const totalScanned = data.reduce((sum, item) => sum + (item.scanned_volume || 0), 0);
  const totalThroughput = data.reduce((sum, item) => sum + item.throughput, 0);
  const totalStaffing = data.reduce((sum, item) => sum + item.staffing_level, 0);
  const totalOvertime = data.reduce((sum, item) => sum + item.overtime_hours, 0);
  const totalPaidDay = data.reduce((sum, item) => sum + (item.paid_day || 0), 0);
  const totalPlannedHours = data.reduce((sum, item) => sum + (item.planned_hours || 0), 0);
  const peakVolume = Math.max(...data.map(item => item.package_volume));

  return {
    total_volume: totalVolume,
    total_scanned: totalScanned,
    avg_throughput: totalThroughput / data.length,
    avg_staffing: totalStaffing / data.length,
    total_overtime: totalOvertime,
    total_paid_day: totalPaidDay,
    avg_pph: data.reduce((sum, item) => sum + (item.actual_pph || 0), 0) / data.length,
    planned_hours: totalPlannedHours,
    records: data.length,
    peak_volume: peakVolume,
  };
}

function Dashboard() {
  const [operations, setOperations] = useState([]);
  const [kpis, setKpis] = useState(getSummary([]));
  const [filters, setFilters] = useState({
    shift: 'All',
    area: 'All',
    group: 'All',
    dateFrom: '',
    dateTo: '',
    search: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ops, kpiData] = await Promise.all([
          axios.get(`${API_BASE_URL}/operations`),
          axios.get(`${API_BASE_URL}/kpis`),
        ]);

        setOperations(ops.data);
        setKpis(kpiData.data);
        setError('');
      } catch (requestError) {
        setError('Unable to load dashboard data. Make sure the Flask API is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const shifts = getUniqueValues(operations, 'shift');
  const areas = getUniqueValues(operations, 'outbound_area');
  const groups = getUniqueValues(operations, 'area_group');
  const filteredOperations = operations.filter(item => {
    const matchesShift = filters.shift === 'All' || item.shift === filters.shift;
    const matchesArea = filters.area === 'All' || item.outbound_area === filters.area;
    const matchesGroup = filters.group === 'All' || item.area_group === filters.group;
    const matchesDateFrom = !filters.dateFrom || item.date >= filters.dateFrom;
    const matchesDateTo = !filters.dateTo || item.date <= filters.dateTo;
    const searchText = `${item.date} ${item.shift} ${item.outbound_area} ${item.area_group}`.toLowerCase();
    const matchesSearch = searchText.includes(filters.search.toLowerCase());

    return matchesShift && matchesArea && matchesGroup && matchesDateFrom && matchesDateTo && matchesSearch;
  });
  const filtersAreDefault = filters.shift === 'All'
    && filters.area === 'All'
    && filters.group === 'All'
    && !filters.dateFrom
    && !filters.dateTo
    && !filters.search;
  const displayedKpis = filtersAreDefault
    ? kpis
    : getSummary(filteredOperations);
  const resetFilters = () => {
    setFilters({
      shift: 'All',
      area: 'All',
      group: 'All',
      dateFrom: '',
      dateTo: '',
      search: '',
    });
  };

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">OO</div>
          <div>
            <p className="eyebrow">OutboundOps</p>
            <h1>Control Center</h1>
          </div>
        </div>

        <nav className="nav-stack" aria-label="Dashboard sections">
          <a href="#overview" className="active">Overview</a>
          <a href="#trends">Trends</a>
          <a href="#areas">Areas</a>
          <a href="#outbounds">Outbounds</a>
          <a href="#risk">Risk</a>
          <a href="#records">Records</a>
        </nav>

        <div className="sidebar-note">
          <span>Live API</span>
          <strong>{operations.length.toLocaleString()} records</strong>
        </div>
      </aside>

      <main className="dashboard-main">
        <section className="topbar" id="overview">
          <div>
            <p className="eyebrow">Warehouse analytics</p>
            <h2>Outbound Operations Dashboard</h2>
            <p className="summary-copy">
              Monitor package flow, staffing pressure, overtime load, and area performance.
            </p>
          </div>
          <div className="status-pill">
            <span className={error ? 'status-dot warning' : 'status-dot'} />
            {error ? 'Needs API' : 'Connected'}
          </div>
        </section>

        {error && (
          <div className="alert-panel" role="alert">
            {error}
          </div>
        )}

        <section className="filter-panel" aria-label="Dashboard filters">
          <label>
            Shift
            <select
              value={filters.shift}
              onChange={event => setFilters({ ...filters, shift: event.target.value })}
            >
              <option>All</option>
              {shifts.map(shift => (
                <option key={shift}>{shift}</option>
              ))}
            </select>
          </label>

          <label>
            Group
            <select
              value={filters.group}
              onChange={event => setFilters({ ...filters, group: event.target.value })}
            >
              <option>All</option>
              {groups.map(group => (
                <option key={group}>{group}</option>
              ))}
            </select>
          </label>

          <label>
            Area
            <select
              value={filters.area}
              onChange={event => setFilters({ ...filters, area: event.target.value })}
            >
              <option>All</option>
              {areas.map(area => (
                <option key={area}>{area}</option>
              ))}
            </select>
          </label>

          <label className="search-control">
            Search
            <input
              type="search"
              value={filters.search}
              placeholder="Date, shift, or area"
              onChange={event => setFilters({ ...filters, search: event.target.value })}
            />
          </label>

          <label>
            From
            <input
              type="date"
              value={filters.dateFrom}
              onChange={event => setFilters({ ...filters, dateFrom: event.target.value })}
            />
          </label>

          <label>
            To
            <input
              type="date"
              value={filters.dateTo}
              onChange={event => setFilters({ ...filters, dateTo: event.target.value })}
            />
          </label>

          <button className="reset-button" type="button" onClick={resetFilters}>
            Reset
          </button>
        </section>

        <KPIcards kpis={displayedKpis} loading={loading} />

        <section className="chart-grid" id="trends">
          <VolumeChart data={filteredOperations} loading={loading} />
          <StaffingChart data={filteredOperations} loading={loading} />
        </section>

        <section className="chart-grid secondary-grid" id="areas">
          <AreaPerformanceChart data={filteredOperations} loading={loading} />
          <AreaLeaderboard data={filteredOperations} loading={loading} />
        </section>

        <section className="wide-grid" id="outbounds">
          <OutboundPerformancePanel data={filteredOperations} loading={loading} />
          <StaffingMatrix data={filteredOperations} loading={loading} />
        </section>

        <section className="chart-grid secondary-grid" id="risk">
          <ShiftMixChart data={filteredOperations} loading={loading} />
          <RiskPanel data={filteredOperations} kpis={displayedKpis} loading={loading} />
        </section>

        <RecommendationsPanel data={filteredOperations} kpis={displayedKpis} loading={loading} />

        <OperationsTable data={filteredOperations} loading={loading} />
      </main>
    </div>
  );
}

export default Dashboard;
