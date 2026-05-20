import React, { useMemo, useState } from 'react';

const STARTER_PROMPTS = [
  'Summarize today',
  'What needs attention?',
  'How is trailer cube?',
  'Staffing recommendation',
  'Forecast explanation',
];

function getTrailerSummary(records) {
  const totalUsed = records.reduce((sum, record) => sum + (record.used_cube || 0), 0);
  const totalCapacity = records.reduce((sum, record) => sum + (record.trailer_capacity || 0), 0);
  const avgCube = totalCapacity ? (totalUsed / totalCapacity) * 100 : 0;
  const lowCube = records.filter(record => (record.cube_utilization || 0) < 70);
  const highCube = records.filter(record => (record.cube_utilization || 0) >= 95);

  return { avgCube, lowCube, highCube };
}

function buildResponse(prompt, kpis, operations, trailerCubeRecords) {
  const text = prompt.toLowerCase();
  const trailerSummary = getTrailerSummary(trailerCubeRecords);
  const peakVolume = Math.round(kpis.peak_volume || 0).toLocaleString();
  const avgSort = Math.round(kpis.avg_sort_volume || 0).toLocaleString();
  const avgStaff = Math.round(kpis.avg_staffing || 0);
  const avgPph = Math.round(kpis.avg_pph || 0);
  const totalVolume = Math.round(kpis.total_volume || 0).toLocaleString();

  if (text.includes('cube') || text.includes('trailer')) {
    if (!trailerCubeRecords.length) {
      return 'I do not see trailer cube records yet. Upload a trailer cube CSV in Import Center with trailer_id, used_cube, and trailer_capacity, then I can flag low-cube and near-capacity loads.';
    }

    return `Average trailer cube is ${trailerSummary.avgCube.toFixed(1)}%. ${trailerSummary.lowCube.length} trailers are under 70% cube and ${trailerSummary.highCube.length} are at 95% or higher. Start by reviewing the lowest cube trailers for consolidation and the 95%+ trailers for load-risk or rolled-volume risk.`;
  }

  if (text.includes('staff')) {
    return `Average staffing is ${avgStaff} people with average PPH around ${avgPph}. If projected volume is near the peak sort volume of ${peakVolume}, plan extra coverage in outbound and sort aisle areas before the sort starts.`;
  }

  if (text.includes('forecast')) {
    return `The forecast uses recent shift volume, day-of-week behavior, shift pattern, and short-term trend. Current average sort volume is ${avgSort}; compare that to the forecast page to decide whether to flex staffing up or down.`;
  }

  if (text.includes('attention') || text.includes('risk')) {
    const highVolume = (kpis.peak_volume || 0) >= 250000;
    const lowCube = trailerSummary.lowCube.length > 0;

    return `${highVolume ? `Peak sort volume is high at ${peakVolume}. ` : `Peak sort volume is ${peakVolume}. `}${lowCube ? `${trailerSummary.lowCube.length} trailers are under 70% cube. ` : ''}Watch staffing, outbound scan volume, late trailers, and low cube loads before committing the plan.`;
  }

  if (text.includes('summary') || text.includes('today')) {
    return `Here is the quick read: ${operations.length.toLocaleString()} filtered records, ${totalVolume} total packages, ${avgSort} average sort volume, ${avgStaff} average staff, and ${trailerCubeRecords.length} trailer cube records available.`;
  }

  return `I can help with volume, staffing, forecasting, trailer cube, SLIC training, and risk. Try asking "How is trailer cube?" or "What needs attention?"`;
}

function AiCompanionPanel({ kpis, operations, trailerCubeRecords }) {
  const initialMessage = useMemo(() => ({
    role: 'assistant',
    text: 'Ask me about volume, staffing, trailer cube utilization, forecasts, or what to watch before the next sort.',
  }), []);
  const [messages, setMessages] = useState([initialMessage]);
  const [prompt, setPrompt] = useState('');

  const sendPrompt = text => {
    const trimmed = text.trim();

    if (!trimmed) {
      return;
    }

    setMessages(current => [
      ...current,
      { role: 'user', text: trimmed },
      { role: 'assistant', text: buildResponse(trimmed, kpis, operations, trailerCubeRecords) },
    ]);
    setPrompt('');
  };

  return (
    <section className="ai-companion-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">AI companion</p>
          <h3>Ops Assistant</h3>
        </div>
        <span>Local companion</span>
      </div>

      <div className="companion-layout">
        <div className="companion-thread">
          {messages.map((message, index) => (
            <article className={`companion-message ${message.role}`} key={`${message.role}-${index}`}>
              <span>{message.role === 'assistant' ? 'Ops Assistant' : 'You'}</span>
              <p>{message.text}</p>
            </article>
          ))}
        </div>

        <aside className="companion-side">
          <strong>Try asking</strong>
          <div className="starter-prompts">
            {STARTER_PROMPTS.map(starter => (
              <button key={starter} type="button" onClick={() => sendPrompt(starter)}>
                {starter}
              </button>
            ))}
          </div>
          <div className="companion-context">
            <div><span>Records</span><strong>{operations.length.toLocaleString()}</strong></div>
            <div><span>Trailer cube rows</span><strong>{trailerCubeRecords.length}</strong></div>
            <div><span>Avg sort</span><strong>{Math.round(kpis.avg_sort_volume || 0).toLocaleString()}</strong></div>
          </div>
        </aside>
      </div>

      <form className="companion-form" onSubmit={event => {
        event.preventDefault();
        sendPrompt(prompt);
      }}>
        <input
          value={prompt}
          placeholder="Ask about cube, staffing, volume, forecast, or risk"
          onChange={event => setPrompt(event.target.value)}
        />
        <button type="submit">Ask</button>
      </form>
    </section>
  );
}

export default AiCompanionPanel;
