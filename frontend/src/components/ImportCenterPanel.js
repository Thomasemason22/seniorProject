import React, { useState } from 'react';

const IMPORT_TYPES = {
  operations: {
    label: 'Operations KPIs',
    help: 'Volume, staffing, hours, PPH, overtime, scans, and area records.',
    sample: 'date,shift,area_group,belt,gross_volume,scanned_volume,staffing_level,hours,overtime_hours,paid_day,notes',
  },
  trailerCube: {
    label: 'Trailer Cube',
    help: 'Trailer capacity, used cube, destination, PD, belt, package count, and load quality.',
    sample: 'date,shift,trailer_id,destination,pd,belt,package_count,used_cube,trailer_capacity,load_quality,departure_time,notes',
  },
};

function parseCsv(text) {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);

  if (!headerLine) {
    return [];
  }

  const headers = headerLine.split(',').map(header => header.trim());

  return lines
    .filter(Boolean)
    .map(line => {
      const values = line.split(',').map(value => value.trim());
      return headers.reduce((record, header, index) => ({
        ...record,
        [header]: values[index] || '',
      }), {});
    });
}

function ImportCenterPanel({ onBulkCreateOperations, onBulkCreateTrailerCube }) {
  const [importType, setImportType] = useState('operations');
  const [previewRows, setPreviewRows] = useState([]);
  const [status, setStatus] = useState('No file selected');
  const [fileName, setFileName] = useState('');
  const selectedType = IMPORT_TYPES[importType];
  const previewHeaders = previewRows.length ? Object.keys(previewRows[0]) : [];

  const loadFile = event => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const rows = parseCsv(reader.result);
      setPreviewRows(rows);
      setFileName(file.name);
      setStatus(`${rows.length} rows ready to import`);
    };
    reader.readAsText(file);
  };

  const importRows = async () => {
    if (!previewRows.length) {
      setStatus('Choose a CSV before importing');
      return;
    }

    if (importType === 'operations') {
      await onBulkCreateOperations(previewRows.map(row => ({
        ...row,
        outbound_area: row.outbound_area || row.belt,
      })));
    } else {
      await onBulkCreateTrailerCube(previewRows);
    }

    setStatus(`${previewRows.length} ${selectedType.label.toLowerCase()} rows imported`);
    setPreviewRows([]);
    setFileName('');
  };

  return (
    <section className="import-center-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">CSV import</p>
          <h3>Import Center</h3>
        </div>
        <span>{status}</span>
      </div>

      <div className="import-grid">
        <div className="import-card">
          <label>
            Import Type
            <select value={importType} onChange={event => setImportType(event.target.value)}>
              {Object.entries(IMPORT_TYPES).map(([key, type]) => (
                <option key={key} value={key}>{type.label}</option>
              ))}
            </select>
          </label>
          <p>{selectedType.help}</p>
          <code>{selectedType.sample}</code>
          <label className="file-button">
            Choose CSV
            <input type="file" accept=".csv,text/csv" onChange={loadFile} />
          </label>
          <button className="reset-button" type="button" onClick={importRows}>
            Import Rows
          </button>
        </div>

        <div className="import-preview-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Preview</p>
              <h3>{fileName || 'Waiting for CSV'}</h3>
            </div>
            <span>{previewRows.length} rows</span>
          </div>

          <div className="table-wrap compact-table">
            {previewRows.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    {previewHeaders.map(header => <th key={header}>{header}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.slice(0, 6).map((row, rowIndex) => (
                    <tr key={`${rowIndex}-${row[previewHeaders[0]]}`}>
                      {previewHeaders.map(header => <td key={header}>{row[header] || '-'}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">Upload a CSV to preview the first rows before importing.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ImportCenterPanel;
