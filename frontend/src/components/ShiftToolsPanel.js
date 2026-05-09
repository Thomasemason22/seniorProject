import React, { useMemo, useState } from 'react';

const areaGroups = [
  'Unload',
  'Outbounds',
  'Airsort',
  'Sort Aisle',
  'Small Sort',
  'Irregulars',
  'Indirect',
  'Metro',
];

function getBelts(group) {
  if (group === 'Unload') {
    return Array.from({ length: 6 }, (_, index) => `UL ${index + 1}`);
  }

  if (group === 'Outbounds') {
    return Array.from({ length: 18 }, (_, index) => `PD ${index + 1}`);
  }

  if (group === 'Sort Aisle') {
    return Array.from({ length: 6 }, (_, index) => `SRT ${index + 1}`);
  }

  if (group === 'Metro') {
    return Array.from({ length: 4 }, (_, index) => `Metro ${index + 1}`);
  }

  return [group];
}

const initialForm = {
  date: new Date().toISOString().slice(0, 10),
  shift: 'Night',
  area_group: 'Outbounds',
  belt: 'PD 1',
  gross_volume: 11000,
  scanned_volume: 7200,
  staffing_level: 10,
  hours: 7.5,
  overtime_hours: 0,
  paid_day: '',
  notes: '',
};

function parseCsv(text) {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(',').map(header => header.trim());

  return lines
    .filter(Boolean)
    .map(line => {
      const values = line.split(',').map(value => value.trim());
      return headers.reduce((record, header, index) => ({
        ...record,
        [header]: values[index],
      }), {});
    });
}

function ShiftToolsPanel({ onCreateRecord, onBulkCreate, onExportCsv, onPrintReport }) {
  const [form, setForm] = useState(initialForm);
  const [csvStatus, setCsvStatus] = useState('');
  const plannedHours = Number(form.gross_volume || 0) / 265;
  const scansEnabled = form.area_group === 'Outbounds';
  const scannedVolume = scansEnabled ? Number(form.scanned_volume || 0) : 0;
  const paidDay = form.paid_day
    ? Number(form.paid_day)
    : (Number(form.staffing_level || 0) * Number(form.hours || 0)) + Number(form.overtime_hours || 0);
  const actualPphVolume = scansEnabled ? scannedVolume : Number(form.gross_volume || 0);
  const actualPph = paidDay ? actualPphVolume / paidDay : 0;
  const belts = useMemo(() => getBelts(form.area_group), [form.area_group]);

  const updateForm = event => {
    const { name, value } = event.target;
    const nextForm = {
      ...form,
      [name]: value,
    };

    if (name === 'area_group') {
      nextForm.belt = getBelts(value)[0];
      nextForm.scanned_volume = value === 'Outbounds' ? initialForm.scanned_volume : 0;
    }

    setForm(nextForm);
  };

  const submitRecord = event => {
    event.preventDefault();
    onCreateRecord({
      ...form,
      outbound_area: form.belt,
      scanned_volume: scansEnabled ? form.scanned_volume : 0,
      paid_day: paidDay,
      planned_hours: plannedHours,
    });
  };

  const handleCsv = event => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const records = parseCsv(reader.result).map(record => ({
        ...record,
        outbound_area: record.outbound_area || record.belt,
      }));

      onBulkCreate(records);
      setCsvStatus(`${records.length} records uploaded`);
    };
    reader.readAsText(file);
  };

  return (
    <section className="tools-panel" id="tools">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Shift tools</p>
          <h3>Entry, Upload, Export</h3>
        </div>
        <div className="tool-actions">
          <button type="button" onClick={onExportCsv}>Export CSV</button>
          <button type="button" onClick={onPrintReport}>Print Report</button>
        </div>
      </div>

      <div className="tools-grid">
        <form className="entry-form" onSubmit={submitRecord}>
          <label>Date<input name="date" type="date" value={form.date} onChange={updateForm} /></label>
          <label>Shift
            <select name="shift" value={form.shift} onChange={updateForm}>
              <option>Day</option>
              <option>Twilight</option>
              <option>Night</option>
            </select>
          </label>
          <label>Group
            <select name="area_group" value={form.area_group} onChange={updateForm}>
              {areaGroups.map(group => <option key={group}>{group}</option>)}
            </select>
          </label>
          <label>Belt
            <select name="belt" value={form.belt} onChange={updateForm}>
              {belts.map(belt => <option key={belt}>{belt}</option>)}
            </select>
          </label>
          <label>Gross<input name="gross_volume" type="number" value={form.gross_volume} onChange={updateForm} /></label>
          <label>Outbound scans<input name="scanned_volume" type="number" value={scansEnabled ? form.scanned_volume : 0} onChange={updateForm} disabled={!scansEnabled} /></label>
          <label>Staff<input name="staffing_level" type="number" value={form.staffing_level} onChange={updateForm} /></label>
          <label>Hours<input name="hours" type="number" step="0.1" value={form.hours} onChange={updateForm} /></label>
          <label>OT<input name="overtime_hours" type="number" step="0.1" value={form.overtime_hours} onChange={updateForm} /></label>
          <label>Notes<input name="notes" value={form.notes} onChange={updateForm} placeholder="Late trailer, jam, short staffed" /></label>
          <button type="submit">Add Record</button>
        </form>

        <div className="upload-card">
          <strong>CSV Upload</strong>
          <p>Use headers like date, shift, area_group, belt, gross_volume, scanned_volume, staffing_level, hours, overtime_hours, notes. Scanned volume is only applied to Outbounds.</p>
          <input type="file" accept=".csv,text/csv" onChange={handleCsv} />
          <span>{csvStatus || 'No CSV selected'}</span>
        </div>

        <div className="calculator-card">
          <strong>Staffing Calculator</strong>
          <dl>
            <div><dt>Planned hours</dt><dd>{plannedHours.toFixed(1)}</dd></div>
            <div><dt>Paid day</dt><dd>{paidDay.toFixed(1)}</dd></div>
            <div><dt>Actual PPH</dt><dd>{Math.round(actualPph).toLocaleString()}</dd></div>
            <div><dt>Suggested staff</dt><dd>{Math.max(1, Math.ceil(plannedHours / Math.max(Number(form.hours || 1), 1)))}</dd></div>
          </dl>
        </div>
      </div>
    </section>
  );
}

export default ShiftToolsPanel;
