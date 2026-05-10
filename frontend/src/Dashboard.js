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
import ShiftToolsPanel from './components/ShiftToolsPanel';
import DailyReportPanel from './components/DailyReportPanel';
import PlanActualPanel from './components/PlanActualPanel';
import BeltDetailPanel from './components/BeltDetailPanel';
import AlertsPanel from './components/AlertsPanel';
import ProcessFlowPanel from './components/ProcessFlowPanel';
import SortVolumeTrend from './components/SortVolumeTrend';
import AreaMixChart from './components/AreaMixChart';
import PDBeltHeatmap from './components/PDBeltHeatmap';
import CapacityAnalysisPanel from './components/CapacityAnalysisPanel';
import SortSummaryPanel from './components/SortSummaryPanel';
import FlowComparisonChart from './components/FlowComparisonChart';
import PDRankingPanel from './components/PDRankingPanel';
import ForecastPanel from './components/ForecastPanel';
import AnomalyPanel from './components/AnomalyPanel';
import OutboundLoadRatePanel from './components/OutboundLoadRatePanel';
import ShiftComparisonPanel from './components/ShiftComparisonPanel';
import StaffingVolumeScatter from './components/StaffingVolumeScatter';
import PPHDistributionChart from './components/PPHDistributionChart';
import AreaEfficiencyPanel from './components/AreaEfficiencyPanel';
import AreaStaffDetailPanel from './components/AreaStaffDetailPanel';

const API_BASE_URL = 'http://127.0.0.1:5000';

function getUniqueValues(data, key) {
  return Array.from(new Set(data.map(item => item[key]))).sort();
}

function getSortTotals(data) {
  const grouped = {};

  data.forEach(item => {
    const key = `${item.date}-${item.shift}`;

    if (!grouped[key]) {
      grouped[key] = {
        date: item.date,
        shift: item.shift,
        volume: 0,
        scanned: 0,
        paidDay: 0,
        plannedHours: 0,
      };
    }

    grouped[key].volume += item.gross_volume || item.package_volume || 0;
    grouped[key].scanned += item.scanned_volume || 0;
    grouped[key].paidDay += item.paid_day || 0;
    grouped[key].plannedHours += item.planned_hours || 0;
  });

  return Object.values(grouped);
}

function getSummary(data) {
  if (!data.length) {
    return {
      total_volume: 0,
      avg_sort_volume: 0,
      peak_sort_volume: 0,
      sort_count: 0,
      avg_throughput: 0,
      avg_staffing: 0,
      total_overtime: 0,
      total_scanned: 0,
      outbound_gross_volume: 0,
      total_paid_day: 0,
      avg_pph: 0,
      planned_hours: 0,
      records: 0,
      peak_volume: 0,
    };
  }

  const totalVolume = data.reduce((sum, item) => sum + item.package_volume, 0);
  const totalScanned = data.reduce((sum, item) => sum + (item.scanned_volume || 0), 0);
  const outboundGrossVolume = data
    .filter(item => item.area_group === 'Outbounds')
    .reduce((sum, item) => sum + (item.gross_volume || item.package_volume), 0);
  const totalThroughput = data.reduce((sum, item) => sum + item.throughput, 0);
  const totalStaffing = data.reduce((sum, item) => sum + item.staffing_level, 0);
  const totalOvertime = data.reduce((sum, item) => sum + item.overtime_hours, 0);
  const totalPaidDay = data.reduce((sum, item) => sum + (item.paid_day || 0), 0);
  const totalPlannedHours = data.reduce((sum, item) => sum + (item.planned_hours || 0), 0);
  const sortTotals = getSortTotals(data);
  const sortVolumes = sortTotals.map(sort => sort.volume);
  const avgSortVolume = sortVolumes.length
    ? sortVolumes.reduce((sum, volume) => sum + volume, 0) / sortVolumes.length
    : 0;
  const peakSortVolume = sortVolumes.length ? Math.max(...sortVolumes) : 0;

  return {
    total_volume: totalVolume,
    avg_sort_volume: avgSortVolume,
    peak_sort_volume: peakSortVolume,
    sort_count: sortTotals.length,
    total_scanned: totalScanned,
    outbound_gross_volume: outboundGrossVolume,
    avg_throughput: totalThroughput / data.length,
    avg_staffing: totalStaffing / data.length,
    total_overtime: totalOvertime,
    total_paid_day: totalPaidDay,
    avg_pph: data.reduce((sum, item) => sum + (item.actual_pph || 0), 0) / data.length,
    planned_hours: totalPlannedHours,
    records: data.length,
    peak_volume: peakSortVolume,
  };
}

function Dashboard() {
  const [operations, setOperations] = useState([]);
  const [selectedBelt, setSelectedBelt] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [role, setRole] = useState('Supervisor');
  const [filters, setFilters] = useState({
    sort: 'All',
    shift: 'All',
    area: 'All',
    group: 'All',
    dateFrom: '',
    dateTo: '',
    search: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const ops = await axios.get(`${API_BASE_URL}/operations`);

      setOperations(ops.data);
      setError('');
    } catch (requestError) {
      setError('Unable to load dashboard data. Make sure the Flask API is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const shifts = getUniqueValues(operations, 'shift');
  const areas = getUniqueValues(operations, 'outbound_area');
  const groups = getUniqueValues(operations, 'area_group');
  const sortOptions = getSortTotals(operations)
    .sort((a, b) => `${b.date} ${b.shift}`.localeCompare(`${a.date} ${a.shift}`));
  const filteredOperations = operations.filter(item => {
    const sortKey = `${item.date}-${item.shift}`;
    const matchesSort = filters.sort === 'All' || sortKey === filters.sort;
    const matchesShift = filters.shift === 'All' || item.shift === filters.shift;
    const matchesArea = filters.area === 'All' || item.outbound_area === filters.area;
    const matchesGroup = filters.group === 'All' || item.area_group === filters.group;
    const matchesDateFrom = !filters.dateFrom || item.date >= filters.dateFrom;
    const matchesDateTo = !filters.dateTo || item.date <= filters.dateTo;
    const searchText = `${item.date} ${item.shift} ${item.outbound_area} ${item.area_group}`.toLowerCase();
    const matchesSearch = searchText.includes(filters.search.toLowerCase());

    return matchesSort && matchesShift && matchesArea && matchesGroup && matchesDateFrom && matchesDateTo && matchesSearch;
  });
  const displayedKpis = getSummary(filteredOperations);
  const resetFilters = () => {
    setFilters({
      sort: 'All',
      shift: 'All',
      area: 'All',
      group: 'All',
      dateFrom: '',
      dateTo: '',
      search: '',
    });
  };
  const createRecord = async record => {
    const response = await axios.post(`${API_BASE_URL}/operations`, record);
    const nextOperations = [response.data, ...operations];
    setOperations(nextOperations);
  };
  const bulkCreate = async records => {
    const response = await axios.post(`${API_BASE_URL}/operations/bulk`, records);
    const nextOperations = [...response.data, ...operations];
    setOperations(nextOperations);
  };
  const exportCsv = () => {
    const headers = [
      'date',
      'shift',
      'area_group',
      'belt',
      'gross_volume',
      'scanned_volume',
      'staffing_level',
      'hours',
      'overtime_hours',
      'paid_day',
      'actual_pph',
      'planned_hours',
      'notes',
    ];
    const rows = filteredOperations.map(item => headers.map(header => `"${String(item[header] ?? '').replaceAll('"', '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'operations-dashboard-export.csv';
    link.click();
    URL.revokeObjectURL(url);
  };
  const printReport = () => {
    window.print();
  };

  useEffect(() => {
    if (filteredOperations.length && !filteredOperations.some(item => item.belt === selectedBelt)) {
      setSelectedBelt(filteredOperations[0].belt);
    }
  }, [filteredOperations, selectedBelt]);

  useEffect(() => {
    if (filteredOperations.length && !filteredOperations.some(item => item.outbound_area === selectedArea || item.belt === selectedArea)) {
      setSelectedArea(filteredOperations[0].outbound_area || filteredOperations[0].belt);
    }
  }, [filteredOperations, selectedArea]);

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">UPS</div>
          <div>
            <p className="eyebrow">UPS operations</p>
            <h1>Control Center</h1>
          </div>
        </div>

        <nav className="nav-stack" aria-label="Dashboard sections">
          <a href="#overview" className="active">Overview</a>
          <a href="#sort-detail">Shift Detail</a>
          <a href="#tools">Tools</a>
          <a href="#report">Report</a>
          <a href="#trends">Trends</a>
          <a href="#analysis">Analysis</a>
          <a href="#areas">Areas</a>
          <a href="#outbounds">Outbounds</a>
          <a href="#risk">Risk</a>
          <a href="#records">Records</a>
        </nav>

        <div className="sidebar-note">
          <span>Live API</span>
          <strong>{operations.length.toLocaleString()} records</strong>
        </div>

        <div className="role-card">
          <label>
            Role
            <select value={role} onChange={event => setRole(event.target.value)}>
              <option>Supervisor</option>
              <option>Admin</option>
              <option>Viewer</option>
            </select>
          </label>
        </div>
      </aside>

      <main className="dashboard-main">
        <section className="topbar" id="overview">
          <div>
            <p className="eyebrow">Warehouse analytics</p>
            <h2>Operations Dashboard</h2>
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
          <label className="sort-control">
            Specific Shift
            <select
              value={filters.sort}
              onChange={event => setFilters({ ...filters, sort: event.target.value })}
            >
              <option value="All">All shifts</option>
              {sortOptions.map(sort => (
                <option key={`${sort.date}-${sort.shift}`} value={`${sort.date}-${sort.shift}`}>
                  {sort.date} {sort.shift} - {Math.round(sort.volume).toLocaleString()}
                </option>
              ))}
            </select>
          </label>

          <label>
            Shift Type
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

        <section id="sort-detail">
          <SortSummaryPanel data={filteredOperations} kpis={displayedKpis} loading={loading} />
        </section>

        {role !== 'Viewer' && (
          <ShiftToolsPanel
            onCreateRecord={createRecord}
            onBulkCreate={bulkCreate}
            onExportCsv={exportCsv}
            onPrintReport={printReport}
          />
        )}

        <section className="wide-grid report-layout">
          <DailyReportPanel data={filteredOperations} kpis={displayedKpis} />
          <PlanActualPanel kpis={displayedKpis} />
        </section>

        <ProcessFlowPanel />

        <section className="wide-grid">
          <BeltDetailPanel
            data={filteredOperations}
            selectedBelt={selectedBelt}
            onSelectBelt={setSelectedBelt}
          />
          <AlertsPanel data={filteredOperations} />
        </section>

        <section className="chart-grid" id="trends">
          <VolumeChart data={filteredOperations} loading={loading} />
          <StaffingChart data={filteredOperations} loading={loading} />
        </section>

        <section className="chart-grid secondary-grid" id="analysis">
          <SortVolumeTrend data={filteredOperations} loading={loading} />
          <CapacityAnalysisPanel data={filteredOperations} loading={loading} />
        </section>

        <section className="chart-grid secondary-grid">
          <FlowComparisonChart data={filteredOperations} loading={loading} />
          <ForecastPanel data={filteredOperations} kpis={displayedKpis} loading={loading} />
        </section>

        <section className="chart-grid secondary-grid">
          <StaffingVolumeScatter data={filteredOperations} loading={loading} />
          <PPHDistributionChart data={filteredOperations} loading={loading} />
        </section>

        <section className="wide-grid">
          <ShiftComparisonPanel data={filteredOperations} loading={loading} />
          <AreaEfficiencyPanel data={filteredOperations} loading={loading} />
        </section>

        <section className="wide-grid">
          <PDBeltHeatmap data={filteredOperations} loading={loading} />
          <AreaMixChart data={filteredOperations} loading={loading} />
        </section>

        <section className="wide-grid">
          <AnomalyPanel data={filteredOperations} kpis={displayedKpis} loading={loading} />
          <PDRankingPanel data={filteredOperations} loading={loading} />
        </section>

        <section className="chart-grid secondary-grid" id="areas">
          <AreaPerformanceChart data={filteredOperations} loading={loading} />
          <AreaLeaderboard
            data={filteredOperations}
            loading={loading}
            selectedArea={selectedArea}
            onSelectArea={setSelectedArea}
          />
        </section>

        <section className="wide-grid">
          <AreaStaffDetailPanel
            data={filteredOperations}
            selectedArea={selectedArea}
            onSelectArea={setSelectedArea}
            loading={loading}
          />
          <AreaEfficiencyPanel data={filteredOperations} loading={loading} />
        </section>

        <section className="wide-grid" id="outbounds">
          <OutboundPerformancePanel data={filteredOperations} loading={loading} />
          <StaffingMatrix data={filteredOperations} loading={loading} />
        </section>

        <section className="wide-grid">
          <OutboundLoadRatePanel data={filteredOperations} loading={loading} />
          <PDRankingPanel data={filteredOperations} loading={loading} />
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
