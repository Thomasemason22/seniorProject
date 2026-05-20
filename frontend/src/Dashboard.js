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
import SlicTrainingPanel from './components/SlicTrainingPanel';
import ImportCenterPanel from './components/ImportCenterPanel';
import TrailerCubePanel from './components/TrailerCubePanel';
import AiCompanionPanel from './components/AiCompanionPanel';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:5050`;

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
  const [trailerCubeRecords, setTrailerCubeRecords] = useState([]);
  const [selectedBelt, setSelectedBelt] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [activePage, setActivePage] = useState('overview');
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
      const [ops, trailerCube] = await Promise.all([
        axios.get(`${API_BASE_URL}/operations`),
        axios.get(`${API_BASE_URL}/trailer-cube`),
      ]);

      setOperations(ops.data);
      setTrailerCubeRecords(trailerCube.data);
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
  const bulkCreateTrailerCube = async records => {
    const response = await axios.post(`${API_BASE_URL}/trailer-cube/bulk`, records);
    const nextRecords = [...response.data, ...trailerCubeRecords];
    setTrailerCubeRecords(nextRecords);
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

  const pages = [
    { id: 'overview', label: 'Overview', eyebrow: 'Warehouse analytics', title: 'Operations Dashboard', copy: 'Monitor package flow, staffing pressure, overtime load, and area performance.' },
    { id: 'sort-detail', label: 'Shift Detail', eyebrow: 'Sort detail', title: 'Shift Detail', copy: 'Review selected shift totals, belt detail, alerts, and package flow.' },
    { id: 'slic-training', label: 'SLIC Trainer', eyebrow: 'Sort aisle training', title: 'SLIC Trainer', copy: 'Practice reading dummy UPS labels and choosing the right belt/transverse side.' },
    { id: 'import-center', label: 'Import Center', eyebrow: 'CSV imports', title: 'Import Center', copy: 'Upload operations KPI and trailer cube CSVs, preview rows, and import data.' },
    { id: 'trailer-cube', label: 'Trailer Cube', eyebrow: 'Cube utilization', title: 'Trailer Cube Utilization', copy: 'Track used cube, trailer capacity, load quality, and low-cube opportunities.' },
    { id: 'ai-companion', label: 'AI Companion', eyebrow: 'Ops companion', title: 'AI Ops Companion', copy: 'Ask operational questions about volume, staffing, forecasting, trailer cube, and risk.' },
    { id: 'tools', label: 'Tools', eyebrow: 'Shift tools', title: 'Entry and Reporting Tools', copy: 'Add records, upload CSV files, export filtered data, and print reports.' },
    { id: 'report', label: 'Report', eyebrow: 'Daily report', title: 'Daily Operations Report', copy: 'Summarize plan versus actual performance and shift notes.' },
    { id: 'trends', label: 'Trends', eyebrow: 'Volume trends', title: 'Volume and Staffing Trends', copy: 'Track package volume, staffing coverage, and throughput patterns.' },
    { id: 'analysis', label: 'Analysis', eyebrow: 'Operations analysis', title: 'Capacity and Flow Analysis', copy: 'Compare sort volume, building capacity, flow mix, and productivity distribution.' },
    { id: 'volume-forecasting', label: 'Forecasting', eyebrow: 'Volume forecasting', title: 'Package Flow Forecasting', copy: 'Project upcoming volume, compare actual versus predicted results, and plan labor.' },
    { id: 'areas', label: 'Areas', eyebrow: 'Area performance', title: 'Area Performance', copy: 'Compare area productivity, staffing, and efficiency.' },
    { id: 'outbounds', label: 'Outbounds', eyebrow: 'Outbound operations', title: 'Outbound Performance', copy: 'Review PD performance, staffing balance, load rates, and outbound rankings.' },
    { id: 'risk', label: 'Risk', eyebrow: 'Risk monitoring', title: 'Risk and Recommendations', copy: 'Surface risk signals, anomalies, and recommended actions.' },
    { id: 'records', label: 'Records', eyebrow: 'Raw records', title: 'Operations Records', copy: 'Inspect the filtered operation records used across the dashboard.' },
  ];
  const currentPage = pages.find(page => page.id === activePage) || pages[0];
  const showFilters = !['slic-training', 'import-center', 'ai-companion'].includes(activePage);
  const showKpis = ['overview', 'sort-detail', 'report', 'trends', 'analysis', 'volume-forecasting', 'areas', 'outbounds', 'risk', 'records'].includes(activePage);

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <>
            <section className="chart-grid">
              <VolumeChart data={filteredOperations} loading={loading} />
              <StaffingChart data={filteredOperations} loading={loading} />
            </section>
            <RecommendationsPanel data={filteredOperations} kpis={displayedKpis} loading={loading} />
          </>
        );
      case 'sort-detail':
        return (
          <>
            <SortSummaryPanel data={filteredOperations} kpis={displayedKpis} loading={loading} />
            <ProcessFlowPanel />
            <section className="wide-grid">
              <BeltDetailPanel
                data={filteredOperations}
                selectedBelt={selectedBelt}
                onSelectBelt={setSelectedBelt}
              />
              <AlertsPanel data={filteredOperations} />
            </section>
          </>
        );
      case 'slic-training':
        return <SlicTrainingPanel />;
      case 'import-center':
        return (
          <ImportCenterPanel
            onBulkCreateOperations={bulkCreate}
            onBulkCreateTrailerCube={bulkCreateTrailerCube}
          />
        );
      case 'trailer-cube':
        return <TrailerCubePanel records={trailerCubeRecords} loading={loading} />;
      case 'ai-companion':
        return (
          <AiCompanionPanel
            kpis={displayedKpis}
            operations={filteredOperations}
            trailerCubeRecords={trailerCubeRecords}
          />
        );
      case 'tools':
        return role !== 'Viewer' ? (
          <ShiftToolsPanel
            onCreateRecord={createRecord}
            onBulkCreate={bulkCreate}
            onExportCsv={exportCsv}
            onPrintReport={printReport}
          />
        ) : (
          <div className="empty-state">Switch to Supervisor or Admin to use entry and export tools.</div>
        );
      case 'report':
        return (
          <section className="wide-grid report-layout">
            <DailyReportPanel data={filteredOperations} kpis={displayedKpis} />
            <PlanActualPanel kpis={displayedKpis} />
          </section>
        );
      case 'trends':
        return (
          <>
            <section className="chart-grid">
              <VolumeChart data={filteredOperations} loading={loading} />
              <StaffingChart data={filteredOperations} loading={loading} />
            </section>
            <section className="chart-grid secondary-grid">
              <PPHDistributionChart data={filteredOperations} loading={loading} />
              <ShiftMixChart data={filteredOperations} loading={loading} />
            </section>
          </>
        );
      case 'analysis':
        return (
          <>
            <section className="chart-grid secondary-grid">
              <SortVolumeTrend data={filteredOperations} loading={loading} />
              <CapacityAnalysisPanel data={filteredOperations} loading={loading} />
            </section>
            <section className="chart-grid secondary-grid">
              <FlowComparisonChart data={filteredOperations} loading={loading} />
              <StaffingVolumeScatter data={filteredOperations} loading={loading} />
            </section>
            <section className="wide-grid">
              <ShiftComparisonPanel data={filteredOperations} loading={loading} />
              <PDRankingPanel data={filteredOperations} loading={loading} />
            </section>
          </>
        );
      case 'volume-forecasting':
        return <ForecastPanel data={filteredOperations} kpis={displayedKpis} loading={loading} />;
      case 'areas':
        return (
          <>
            <section className="chart-grid secondary-grid">
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
            <section className="wide-grid">
              <PDBeltHeatmap data={filteredOperations} loading={loading} />
              <AreaMixChart data={filteredOperations} loading={loading} />
            </section>
          </>
        );
      case 'outbounds':
        return (
          <>
            <section className="wide-grid">
              <OutboundPerformancePanel data={filteredOperations} loading={loading} />
              <StaffingMatrix data={filteredOperations} loading={loading} />
            </section>
            <section className="wide-grid">
              <OutboundLoadRatePanel data={filteredOperations} loading={loading} />
              <PDRankingPanel data={filteredOperations} loading={loading} />
            </section>
          </>
        );
      case 'risk':
        return (
          <>
            <section className="chart-grid secondary-grid">
              <RiskPanel data={filteredOperations} kpis={displayedKpis} loading={loading} />
              <AnomalyPanel data={filteredOperations} kpis={displayedKpis} loading={loading} />
            </section>
            <RecommendationsPanel data={filteredOperations} kpis={displayedKpis} loading={loading} />
          </>
        );
      case 'records':
        return <OperationsTable data={filteredOperations} loading={loading} />;
      default:
        return null;
    }
  };

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
          {pages.map(page => (
            <button
              className={activePage === page.id ? 'active' : ''}
              key={page.id}
              type="button"
              onClick={() => setActivePage(page.id)}
            >
              {page.label}
            </button>
          ))}
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
        <section className="topbar">
          <div>
            <p className="eyebrow">{currentPage.eyebrow}</p>
            <h2>{currentPage.title}</h2>
            <p className="summary-copy">{currentPage.copy}</p>
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

        {showFilters && (
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
        )}

        {showKpis && <KPIcards kpis={displayedKpis} loading={loading} />}

        <div className="page-content">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
