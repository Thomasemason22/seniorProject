import React from 'react';

const firstNames = [
  'Alex',
  'Jordan',
  'Taylor',
  'Morgan',
  'Casey',
  'Riley',
  'Jamie',
  'Drew',
  'Cameron',
  'Avery',
  'Sam',
  'Quinn',
  'Parker',
  'Reese',
  'Hayden',
  'Logan',
  'Devin',
  'Skyler',
  'Rowan',
  'Emerson',
  'Jesse',
  'Kai',
  'Micah',
  'Blake',
  'Terry',
  'Shawn',
  'Robin',
  'Marley',
  'Kendall',
  'Harper',
];

const lastNames = [
  'Mason',
  'Rivera',
  'Chen',
  'Patel',
  'Johnson',
  'Garcia',
  'Brooks',
  'Carter',
  'Bennett',
  'Reed',
  'Cooper',
  'Diaz',
  'Murphy',
  'Bailey',
  'Foster',
  'Kelly',
  'Price',
  'Ross',
  'Hayes',
  'Young',
  'Cole',
  'Long',
  'Ward',
  'Bell',
  'Gray',
  'James',
  'Scott',
  'Wood',
  'Perry',
  'Hughes',
];

function getAreaRoles(group) {
  if (group === 'Outbounds') {
    return ['Loader', 'Scanner', 'Responder', 'Belt tender'];
  }

  if (group === 'Unload') {
    return ['Unloader', 'Splitter', 'Belt tender', 'Responder'];
  }

  if (group === 'Sort Aisle') {
    return ['Sorter', 'Pickoff', 'Responder', 'Belt tender'];
  }

  if (group === 'Small Sort') {
    return ['Small sort', 'Bagging', 'Sorter', 'Responder'];
  }

  return ['Handler', 'Responder', 'Support', 'Belt tender'];
}

function getStartTime(shift, index) {
  const starts = {
    Day: ['08:00', '08:15', '08:30'],
    Twilight: ['17:00', '17:15', '17:30'],
    Midnight: ['23:00', '23:15', '23:30'],
  };
  const options = starts[shift] || ['08:00', '08:15', '08:30'];

  return options[index % options.length];
}

function buildStaffingSheet(row) {
  if (!row) {
    return [];
  }

  const count = Math.max(0, row.staffing_level || 0);
  const roles = getAreaRoles(row.area_group);
  const areaSeed = [...(row.belt || row.outbound_area || '')].reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return Array.from({ length: count }, (_, index) => {
    const nameIndex = (areaSeed + index) % firstNames.length;
    const lastIndex = (areaSeed + (index * 3)) % lastNames.length;
    const role = roles[index % roles.length];
    const hours = Math.max(3.5, Number(row.hours || 0) - (index % 4 === 0 ? 0.5 : 0));
    const status = index < Math.ceil(count * 0.82)
      ? 'Assigned'
      : index % 2 === 0 ? 'Flex' : 'Training';

    return {
      id: `${row.id}-${index}`,
      name: `${firstNames[nameIndex]} ${lastNames[lastIndex]}`,
      role,
      start: getStartTime(row.shift, index),
      hours,
      status,
      assignment: role === 'Loader' ? `${row.belt} load wall` : row.belt || row.outbound_area,
    };
  });
}

function getAreaRows(data, selectedArea) {
  if (!selectedArea) {
    return [];
  }

  return data.filter(item => item.outbound_area === selectedArea || item.belt === selectedArea);
}

function AreaStaffDetailPanel({ data, selectedArea, onSelectArea, loading }) {
  const areas = Array.from(new Set(data.map(item => item.outbound_area || item.belt))).sort();
  const rows = getAreaRows(data, selectedArea || areas[0]);
  const areaName = selectedArea || areas[0] || 'No area';
  const shiftCount = new Set(rows.map(item => `${item.date}-${item.shift}`)).size || 1;
  const volume = rows.reduce((sum, item) => sum + (item.gross_volume || item.package_volume || 0), 0);
  const staffTotal = rows.reduce((sum, item) => sum + (item.staffing_level || 0), 0);
  const paidDay = rows.reduce((sum, item) => sum + (item.paid_day || 0), 0);
  const overtime = rows.reduce((sum, item) => sum + (item.overtime_hours || 0), 0);
  const avgStaff = rows.length ? staffTotal / rows.length : 0;
  const peakStaff = rows.length ? Math.max(...rows.map(item => item.staffing_level || 0)) : 0;
  const pph = paidDay ? volume / paidDay : 0;
  const avgVolume = volume / shiftCount;
  const avgPaidDay = paidDay / shiftCount;
  const avgOvertime = overtime / shiftCount;
  const recentRows = [...rows]
    .sort((a, b) => `${b.date} ${b.shift}`.localeCompare(`${a.date} ${a.shift}`))
    .slice(0, 8);
  const staffingRecord = recentRows[0];
  const staffingSheet = buildStaffingSheet(staffingRecord);

  return (
    <section className="area-staff-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Area staff detail</p>
          <h3>{areaName}</h3>
        </div>
        <span>{loading ? 'Loading' : `${rows.length} records`}</span>
      </div>

      <div className="area-picker">
        {areas.map(area => (
          <button
            className={area === areaName ? 'selected' : ''}
            key={area}
            type="button"
            onClick={() => onSelectArea(area)}
          >
            {area}
          </button>
        ))}
      </div>

      <div className="staff-summary-grid">
        <article><span>Avg staff</span><strong>{avgStaff.toFixed(1)}</strong></article>
        <article><span>Peak staff</span><strong>{peakStaff}</strong></article>
        <article><span>Avg paid day</span><strong>{avgPaidDay.toFixed(1)}</strong></article>
        <article><span>Avg overtime</span><strong>{avgOvertime.toFixed(1)}</strong></article>
        <article><span>Avg volume</span><strong>{Math.round(avgVolume).toLocaleString()}</strong></article>
        <article><span>PPH</span><strong>{Math.round(pph).toLocaleString()}</strong></article>
      </div>

      <div className="staffing-sheet">
        <div className="sheet-heading">
          <div>
            <strong>Staffing Sheet</strong>
            <span>{staffingRecord ? `${staffingRecord.date} ${staffingRecord.shift}` : 'No shift selected'}</span>
          </div>
          <em>{staffingSheet.length} employees</em>
        </div>

        <div className="staffing-sheet-table">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Start</th>
                <th>Hours</th>
                <th>Status</th>
                <th>Assignment</th>
              </tr>
            </thead>
            <tbody>
              {staffingSheet.map(employee => (
                <tr key={employee.id}>
                  <td>{employee.name}</td>
                  <td>{employee.role}</td>
                  <td>{employee.start}</td>
                  <td>{employee.hours.toFixed(1)}</td>
                  <td><span className={`staff-status ${employee.status.toLowerCase()}`}>{employee.status}</span></td>
                  <td>{employee.assignment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="staff-record-list">
        {recentRows.map(row => (
          <article key={row.id}>
            <div>
              <strong>{row.date}</strong>
              <span>{row.shift} · {row.area_group}</span>
            </div>
            <dl>
              <div><dt>Staff</dt><dd>{row.staffing_level}</dd></div>
              <div><dt>Paid</dt><dd>{(row.paid_day || 0).toFixed(1)}</dd></div>
              <div><dt>OT</dt><dd>{(row.overtime_hours || 0).toFixed(1)}</dd></div>
              <div><dt>PPH</dt><dd>{Math.round(row.actual_pph || 0).toLocaleString()}</dd></div>
            </dl>
          </article>
        ))}
      </div>

      {!loading && rows.length === 0 && (
        <div className="empty-state">Select an area to view staffing detail.</div>
      )}
    </section>
  );
}

export default AreaStaffDetailPanel;
