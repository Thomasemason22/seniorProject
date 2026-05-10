import React from 'react';

function getRows(data) {
  const grouped = {};

  data
    .filter(item => item.area_group === 'Outbounds')
    .forEach(item => {
      if (!grouped[item.belt]) {
        grouped[item.belt] = {
          belt: item.belt,
          gross: 0,
          scanned: 0,
          records: 0,
          overScanCap: 0,
        };
      }

      grouped[item.belt].gross += item.gross_volume || item.package_volume || 0;
      grouped[item.belt].scanned += item.scanned_volume || 0;
      grouped[item.belt].records += 1;

      if ((item.scanned_volume || 0) >= 8000) {
        grouped[item.belt].overScanCap += 1;
      }
    });

  return Object.values(grouped)
    .map(row => ({
      ...row,
      avgGross: row.records ? row.gross / row.records : 0,
      avgScans: row.records ? row.scanned / row.records : 0,
      scanRate: row.gross ? (row.scanned / row.gross) * 100 : 0,
    }))
    .sort((a, b) => b.avgGross - a.avgGross);
}

function PDRankingPanel({ data, loading }) {
  const rows = getRows(data);
  const lowestScanRows = [...rows].sort((a, b) => a.scanRate - b.scanRate).slice(0, 5);
  const topVolumeRows = rows.slice(0, 5);

  return (
    <section className="ranking-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">PD performance</p>
          <h3>Volume and Scan Rankings</h3>
        </div>
        <span>{loading ? 'Loading' : `${rows.length} PDs`}</span>
      </div>

      <div className="ranking-columns">
        <div>
          <strong>Highest avg volume</strong>
          {topVolumeRows.map(row => (
            <article key={row.belt}>
              <span>{row.belt}</span>
              <em>{Math.round(row.avgGross).toLocaleString()} avg gross</em>
              <small>{Math.round(row.avgScans).toLocaleString()} avg scans</small>
            </article>
          ))}
        </div>

        <div>
          <strong>Lowest scan rate</strong>
          {lowestScanRows.map(row => (
            <article key={row.belt}>
              <span>{row.belt}</span>
              <em>{row.scanRate.toFixed(1)}% scan rate</em>
              <small>{row.overScanCap} cap hits</small>
            </article>
          ))}
        </div>
      </div>

      {!loading && rows.length === 0 && (
        <div className="empty-state">No PD ranking data matches the current filters.</div>
      )}
    </section>
  );
}

export default PDRankingPanel;
