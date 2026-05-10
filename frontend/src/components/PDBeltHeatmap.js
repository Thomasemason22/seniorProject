import React from 'react';

function getPdRows(data) {
  const grouped = {};

  data
    .filter(item => item.area_group === 'Outbounds')
    .forEach(item => {
      if (!grouped[item.belt]) {
        grouped[item.belt] = {
          belt: item.belt,
          gross: 0,
          scanned: 0,
          peakGross: 0,
          records: 0,
        };
      }

      grouped[item.belt].gross += item.gross_volume || item.package_volume || 0;
      grouped[item.belt].scanned += item.scanned_volume || 0;
      grouped[item.belt].peakGross = Math.max(grouped[item.belt].peakGross, item.gross_volume || item.package_volume || 0);
      grouped[item.belt].records += 1;
    });

  return Object.values(grouped)
    .map(row => ({
      ...row,
      avgGross: row.records ? row.gross / row.records : 0,
      scanRate: row.gross ? (row.scanned / row.gross) * 100 : 0,
    }))
    .sort((a, b) => Number(a.belt.replace('PD ', '')) - Number(b.belt.replace('PD ', '')));
}

function PDBeltHeatmap({ data, loading }) {
  const rows = getPdRows(data);

  return (
    <section className="heatmap-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">PD belt map</p>
          <h3>Average Volume and Scan Rate</h3>
        </div>
        <span>{loading ? 'Loading' : `${rows.length} PDs`}</span>
      </div>

      <div className="pd-heatmap">
        {rows.map(row => {
          const intensity = Math.min(1, row.avgGross / 12000);

          return (
            <article
              className="pd-heatmap-cell"
              key={row.belt}
              style={{
                '--heat': intensity,
              }}
            >
              <strong>{row.belt}</strong>
              <span>{Math.round(row.avgGross).toLocaleString()} avg</span>
              <em>{row.scanRate.toFixed(1)}% scan</em>
              <small>Peak {Math.round(row.peakGross).toLocaleString()}</small>
            </article>
          );
        })}
      </div>

      {!loading && rows.length === 0 && (
        <div className="empty-state">No PD belt data matches the current filters.</div>
      )}
    </section>
  );
}

export default PDBeltHeatmap;
