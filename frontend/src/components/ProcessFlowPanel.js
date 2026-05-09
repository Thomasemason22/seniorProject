import React from 'react';

const steps = [
  {
    title: 'Arrival & Unload',
    detail: 'Inbound trailers, package cars, air containers, and planes feed volume into UL belts and the conveyor system.',
  },
  {
    title: 'Automated Sortation',
    detail: 'Smart labels route packages through primary and secondary sort paths toward the correct belt or loading area.',
  },
  {
    title: 'Special Handling',
    detail: 'Small sort, irregulars, airsort, metro, and indirect work isolate packages that need different handling paths.',
  },
  {
    title: 'Outbound Scan & Load',
    detail: 'PD outbound belts are where scanned volume is captured, then loaders build walls and close the outbound trailer.',
  },
  {
    title: 'Departure',
    detail: 'The completed trailer leaves for the next hub, center, or air movement with load data confirmed.',
  },
];

function ProcessFlowPanel() {
  return (
    <section className="process-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Hub flow</p>
          <h3>Package Journey</h3>
        </div>
      </div>
      <div className="process-steps">
        {steps.map((step, index) => (
          <article key={step.title}>
            <span>{index + 1}</span>
            <strong>{step.title}</strong>
            <p>{step.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ProcessFlowPanel;
