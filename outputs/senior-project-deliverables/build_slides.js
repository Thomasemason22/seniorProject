const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

const baseDir = __dirname;
const outPath = path.join(baseDir, "OutboundOps_Senior_Project_Slides.pptx");
const metrics = JSON.parse(fs.readFileSync(path.join(baseDir, "metrics.json"), "utf8"));

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "OutboundOps Dashboard";
pptx.subject = "Senior project presentation";
pptx.title = "OutboundOps Dashboard";
pptx.company = "FDU Senior Project";
pptx.lang = "en-US";
pptx.theme = {
  headFontFace: "Aptos Display",
  bodyFontFace: "Aptos",
  lang: "en-US",
};
pptx.defineLayout({ name: "CUSTOM_WIDE", width: 13.333, height: 7.5 });
pptx.layout = "CUSTOM_WIDE";

const C = {
  bg: "F4EFE8",
  surface: "FFFFFF",
  cream: "FBF7EF",
  brown: "351C15",
  brown2: "4F2B1D",
  gold: "FFB500",
  blue: "3B5F8A",
  green: "177245",
  red: "B42318",
  muted: "725A49",
  line: "E4D5C2",
  ink: "2D180F",
};

function fmt(n, d = 0) {
  return Number(n).toLocaleString("en-US", {
    maximumFractionDigits: d,
    minimumFractionDigits: d,
  });
}

function pct(n, d = 1) {
  return `${(n * 100).toFixed(d)}%`;
}

function slideBase(slide, kicker, title) {
  slide.background = { color: C.bg };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.12,
    fill: { color: C.gold },
    line: { color: C.gold },
  });
  slide.addText(kicker.toUpperCase(), {
    x: 0.55,
    y: 0.38,
    w: 4.5,
    h: 0.22,
    fontFace: "Aptos",
    fontSize: 8.5,
    bold: true,
    color: C.muted,
    margin: 0,
    breakLine: false,
    fit: "shrink",
  });
  slide.addText(title, {
    x: 0.55,
    y: 0.62,
    w: 8.5,
    h: 0.55,
    fontFace: "Aptos Display",
    fontSize: 24,
    bold: true,
    color: C.brown,
    margin: 0,
    fit: "shrink",
  });
  slide.addText("OutboundOps Dashboard", {
    x: 10.65,
    y: 0.42,
    w: 2.1,
    h: 0.28,
    align: "right",
    fontFace: "Aptos",
    fontSize: 8.5,
    color: C.muted,
    margin: 0,
  });
}

function footer(slide, n) {
  slide.addText(String(n).padStart(2, "0"), {
    x: 12.55,
    y: 7.08,
    w: 0.35,
    h: 0.18,
    align: "right",
    fontSize: 8,
    color: C.muted,
    margin: 0,
  });
}

function card(slide, x, y, w, h, opts = {}) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.08,
    fill: { color: opts.fill || C.surface },
    line: { color: opts.line || C.line, width: 0.7 },
    shadow: opts.shadow ? { type: "outer", color: "D9C6AF", opacity: 0.25, blur: 1, angle: 45, distance: 1 } : undefined,
  });
}

function metric(slide, x, y, w, label, value, accent = C.gold) {
  card(slide, x, y, w, 1.15, { fill: C.surface });
  slide.addShape(pptx.ShapeType.rect, { x, y, w: 0.08, h: 1.15, fill: { color: accent }, line: { color: accent } });
  slide.addText(value, {
    x: x + 0.22,
    y: y + 0.2,
    w: w - 0.35,
    h: 0.4,
    fontSize: 19,
    bold: true,
    color: C.brown,
    margin: 0,
    fit: "shrink",
  });
  slide.addText(label, {
    x: x + 0.22,
    y: y + 0.68,
    w: w - 0.35,
    h: 0.28,
    fontSize: 8.8,
    bold: true,
    color: C.muted,
    margin: 0,
    fit: "shrink",
  });
}

function bulletList(slide, items, x, y, w, h, options = {}) {
  const runs = [];
  items.forEach((item) => {
    runs.push({
      text: item,
      options: {
        bullet: { type: "bullet" },
        breakLine: true,
        hanging: 4,
      },
    });
  });
  slide.addText(runs, {
    x,
    y,
    w,
    h,
    fontSize: options.size || 14,
    color: options.color || C.ink,
    margin: 0.02,
    breakLine: false,
    fit: "shrink",
    paraSpaceAfterPt: 8,
  });
}

function bars(slide, data, x, y, w, h) {
  const max = Math.max(...data.map((d) => d.volume));
  const rowH = h / data.length;
  data.forEach((item, i) => {
    const yy = y + i * rowH;
    slide.addText(item.name, {
      x,
      y: yy + 0.05,
      w: 1.1,
      h: 0.16,
      fontSize: 8,
      color: C.ink,
      bold: true,
      margin: 0,
      fit: "shrink",
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: x + 1.2,
      y: yy + 0.04,
      w: w - 2.1,
      h: 0.18,
      fill: { color: "EAD8BD" },
      line: { color: "EAD8BD" },
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: x + 1.2,
      y: yy + 0.04,
      w: (w - 2.1) * (item.volume / max),
      h: 0.18,
      fill: { color: [C.brown, C.gold, C.blue, C.green, C.red, "7A5A00", C.muted, "A36A2C"][i % 8] },
      line: { color: [C.brown, C.gold, C.blue, C.green, C.red, "7A5A00", C.muted, "A36A2C"][i % 8] },
    });
    slide.addText(`${pct(item.share)} | ${fmt(item.volume)}`, {
      x: x + w - 0.78,
      y: yy + 0.03,
      w: 0.75,
      h: 0.18,
      fontSize: 7.3,
      color: C.muted,
      margin: 0,
      fit: "shrink",
    });
  });
}

function addTable(slide, x, y, w, h, headers, rows) {
  const data = [
    headers.map((h) => ({ text: h, options: { bold: true, color: C.brown, fill: C.cream } })),
    ...rows,
  ];
  slide.addTable(data, {
    x,
    y,
    w,
    h,
    border: { color: C.line, width: 0.5 },
    margin: 0.04,
    fontFace: "Aptos",
    fontSize: 8.7,
    color: C.ink,
    valign: "mid",
    fit: "shrink",
  });
}

const slides = [];

{
  const s = pptx.addSlide();
  s.background = { color: C.brown };
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.16, fill: { color: C.gold }, line: { color: C.gold } });
  s.addText("UPS OPERATIONS ANALYTICS", { x: 0.7, y: 0.7, w: 5, h: 0.24, color: "EAD8BD", fontSize: 10, bold: true, margin: 0 });
  s.addText("OutboundOps Dashboard", { x: 0.7, y: 1.18, w: 8.7, h: 0.8, color: "FFFFFF", fontSize: 38, bold: true, margin: 0, fit: "shrink" });
  s.addText("A full-stack senior project that converts warehouse volume, scan, staffing, and labor records into supervisor-ready decision support.", {
    x: 0.74,
    y: 2.1,
    w: 7.4,
    h: 0.75,
    color: "F8FAFC",
    fontSize: 16,
    margin: 0,
    fit: "shrink",
    breakLine: false,
  });
  metric(s, 0.75, 3.55, 2.55, "Operational records", fmt(metrics.records), C.gold);
  metric(s, 3.55, 3.55, 2.55, "Total package volume", `${(metrics.total_volume / 1000000).toFixed(2)}M`, C.blue);
  metric(s, 6.35, 3.55, 2.55, "Outbound scan rate", pct(metrics.scan_rate), C.green);
  card(s, 9.55, 0.9, 2.65, 5.35, { fill: "24110D", line: "4F2B1D" });
  s.addText("Project Stack", { x: 9.9, y: 1.25, w: 1.8, h: 0.3, fontSize: 17, bold: true, color: C.gold, margin: 0 });
  bulletList(s, ["Flask API", "SQLite + SQLAlchemy", "Pandas KPI layer", "React dashboard", "Chart.js panels"], 9.92, 1.85, 1.9, 2.55, { size: 13, color: "FFFFFF" });
  s.addText("FDU Senior Project", { x: 0.74, y: 6.78, w: 2.8, h: 0.25, color: "EAD8BD", fontSize: 9, margin: 0 });
  slides.push(s);
}

{
  const s = pptx.addSlide();
  slideBase(s, "Problem", "Raw operations records do not tell supervisors where to act");
  card(s, 0.65, 1.55, 5.55, 4.75, { fill: C.surface });
  s.addText("Operational decision gap", { x: 0.98, y: 1.88, w: 3.9, h: 0.35, fontSize: 19, bold: true, color: C.brown, margin: 0 });
  bulletList(s, [
    "Package volume, scans, staffing, paid day, overtime, and PPH live at row level.",
    "Supervisors need shift-level and area-level answers during the operation.",
    "The project turns descriptive logs into active performance, risk, and staffing views.",
  ], 1.03, 2.45, 4.75, 2.8);
  card(s, 6.55, 1.55, 5.9, 4.75, { fill: C.cream });
  s.addText("Target user workflow", { x: 6.9, y: 1.88, w: 3.9, h: 0.35, fontSize: 19, bold: true, color: C.brown, margin: 0 });
  bulletList(s, [
    "Select a shift, area group, belt, or date range.",
    "Review volume, labor, scan, and capacity KPIs.",
    "Use alerts, rankings, and recommendations to rebalance before the next shift.",
  ], 6.95, 2.45, 4.95, 2.8);
  footer(s, 2);
  slides.push(s);
}

{
  const s = pptx.addSlide();
  slideBase(s, "Dataset", "The seeded data is large enough to test meaningful operational slicing");
  metric(s, 0.7, 1.42, 2.25, "Sorts modeled", fmt(metrics.sort_count), C.gold);
  metric(s, 3.17, 1.42, 2.25, "Average shift volume", fmt(metrics.avg_sort_volume), C.blue);
  metric(s, 5.64, 1.42, 2.25, "Peak shift volume", fmt(metrics.peak_sort_volume), C.red);
  metric(s, 8.11, 1.42, 2.25, "Average staffing", fmt(metrics.avg_staffing, 1), C.green);
  metric(s, 10.58, 1.42, 2.25, "Total overtime", fmt(metrics.overtime, 1), C.brown2);
  card(s, 0.75, 3.02, 11.8, 3.38, { fill: C.surface });
  bars(s, metrics.groups, 1.05, 3.38, 10.95, 2.35);
  s.addText(`Dataset window: ${metrics.date_from} to ${metrics.date_to}`, { x: 1.05, y: 6.03, w: 4.8, h: 0.22, fontSize: 8.7, color: C.muted, margin: 0 });
  footer(s, 3);
  slides.push(s);
}

{
  const s = pptx.addSlide();
  slideBase(s, "Architecture", "A conventional full stack keeps the project explainable and demo-ready");
  const boxes = [
    ["Seed data", "30 days x 3 shifts\nUL, PD, SRT, Metro,\nand support areas", C.cream],
    ["Flask API", "operations endpoint\nbulk create\nKPI endpoint", "FFF7D6"],
    ["Analytics", "volume, scans, PPH\npaid day, risk inputs\nplanned hours", "EEF5FF"],
    ["React UI", "filters, charts,\nalerts, export,\nprint report", "EFFAF3"],
  ];
  boxes.forEach((b, i) => {
    const x = 0.72 + i * 3.15;
    card(s, x, 1.78, 2.35, 3.25, { fill: b[2] });
    s.addText(b[0], { x: x + 0.22, y: 2.08, w: 1.8, h: 0.3, fontSize: 18, bold: true, color: C.brown, margin: 0, fit: "shrink" });
    s.addText(b[1], { x: x + 0.22, y: 2.72, w: 1.82, h: 1.45, fontSize: 12.5, color: C.muted, margin: 0, breakLine: false, fit: "shrink" });
    if (i < boxes.length - 1) {
      s.addShape(pptx.ShapeType.rightArrow, { x: x + 2.48, y: 3.12, w: 0.55, h: 0.32, fill: { color: C.gold }, line: { color: C.gold } });
    }
  });
  s.addText("Design principle: keep every transformation traceable from raw record to visible KPI.", { x: 1, y: 5.92, w: 8.9, h: 0.3, fontSize: 14, bold: true, color: C.brown, margin: 0 });
  footer(s, 4);
  slides.push(s);
}

{
  const s = pptx.addSlide();
  slideBase(s, "Data model", "Each operation row captures both package flow and labor context");
  addTable(s, 0.8, 1.55, 5.6, 4.85, ["Category", "Fields"], [
    ["Sort identity", "date, shift, area group, outbound area, belt"],
    ["Volume", "package volume, gross volume, scanned volume"],
    ["Labor", "staffing level, hours, paid day, overtime hours"],
    ["Performance", "throughput, actual PPH, planned PPH, planned hours"],
    ["Annotation", "notes"],
  ]);
  card(s, 7.0, 1.55, 4.85, 4.85, { fill: C.surface });
  s.addText("Why this matters", { x: 7.35, y: 1.9, w: 3.2, h: 0.35, fontSize: 19, bold: true, color: C.brown, margin: 0 });
  bulletList(s, [
    "The same record supports flow, staffing, and efficiency analysis.",
    "Outbounds can compare gross volume to scanned volume by PD belt.",
    "Paid day and overtime make labor pressure visible, not just package pressure.",
  ], 7.38, 2.55, 3.8, 2.9);
  footer(s, 5);
  slides.push(s);
}

{
  const s = pptx.addSlide();
  slideBase(s, "Dashboard", "The interface is organized around supervisor questions");
  const features = [
    ["Overview", "KPI cards and global status"],
    ["Shift Detail", "sort summary and plan vs. actual"],
    ["Trends", "volume, staffing, flow, capacity, PPH"],
    ["Outbounds", "PD heatmap, load rate, belt ranking"],
    ["Risk", "operational pressure and recommended actions"],
    ["Records", "filterable table plus CSV export"],
  ];
  features.forEach((f, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.8 + col * 4.05;
    const y = 1.55 + row * 2.15;
    card(s, x, y, 3.35, 1.45, { fill: row === 0 ? C.surface : C.cream });
    s.addText(f[0], { x: x + 0.22, y: y + 0.22, w: 2.4, h: 0.28, fontSize: 16.5, bold: true, color: C.brown, margin: 0, fit: "shrink" });
    s.addText(f[1], { x: x + 0.22, y: y + 0.7, w: 2.65, h: 0.35, fontSize: 10.7, color: C.muted, margin: 0, fit: "shrink" });
  });
  s.addText("Core interaction: every filter recomputes visible summaries, charts, rankings, and risk panels.", { x: 1.0, y: 6.28, w: 8.5, h: 0.3, fontSize: 13, bold: true, color: C.brown, margin: 0 });
  footer(s, 6);
  slides.push(s);
}

{
  const s = pptx.addSlide();
  slideBase(s, "Analytics", "The project uses transparent data mining signals");
  const items = [
    ["Aggregation", "Totals and averages by shift, area group, belt, and date range."],
    ["Benchmarking", "Planned hours, paid day, throughput, and PPH comparisons."],
    ["Risk scoring", "High-overtime exposure plus throughput pressure."],
    ["Decision support", "Recommendations for flex coverage, staffing floors, and standup focus."],
  ];
  items.forEach((item, i) => {
    card(s, 0.8 + (i % 2) * 5.95, 1.68 + Math.floor(i / 2) * 2.25, 5.2, 1.55, { fill: i % 2 === 0 ? C.surface : C.cream });
    s.addText(item[0], { x: 1.1 + (i % 2) * 5.95, y: 1.96 + Math.floor(i / 2) * 2.25, w: 2.5, h: 0.32, fontSize: 18, bold: true, color: C.brown, margin: 0 });
    s.addText(item[1], { x: 1.1 + (i % 2) * 5.95, y: 2.48 + Math.floor(i / 2) * 2.25, w: 4.2, h: 0.42, fontSize: 11.5, color: C.muted, margin: 0, fit: "shrink" });
  });
  footer(s, 7);
  slides.push(s);
}

{
  const s = pptx.addSlide();
  slideBase(s, "Evidence", "The dashboard reflects operational reality in the seeded data");
  addTable(s, 0.75, 1.55, 6.15, 4.9, ["Area", "Share", "Avg PPH", "Overtime"], metrics.groups.slice(0, 6).map((g) => [
    g.name,
    pct(g.share),
    fmt(g.avg_pph, 1),
    fmt(g.overtime, 1),
  ]));
  card(s, 7.35, 1.55, 4.65, 4.9, { fill: C.surface });
  s.addText("Readout", { x: 7.7, y: 1.9, w: 2.3, h: 0.33, fontSize: 19, bold: true, color: C.brown, margin: 0 });
  bulletList(s, [
    `Outbounds represents ${pct(metrics.outbound_volume / metrics.total_volume)} of gross volume.`,
    `The scan-rate signal reaches ${pct(metrics.scan_rate)}, creating an outbound quality KPI.`,
    `Peak shift volume is ${fmt(metrics.peak_sort_volume)}, which justifies capacity and staffing views.`,
  ], 7.72, 2.55, 3.55, 2.55);
  footer(s, 8);
  slides.push(s);
}

{
  const s = pptx.addSlide();
  slideBase(s, "Limitations", "The prototype is strong enough for demonstration, with clear production next steps");
  card(s, 0.8, 1.55, 5.45, 4.75, { fill: C.surface });
  s.addText("Current limits", { x: 1.13, y: 1.9, w: 2.8, h: 0.35, fontSize: 19, bold: true, color: C.brown, margin: 0 });
  bulletList(s, [
    "Synthetic dataset, not live operational telemetry.",
    "Role control is represented in the UI, not secured end to end.",
    "SQLite and client-side rollups should be upgraded for production-scale usage.",
  ], 1.16, 2.55, 4.25, 2.6);
  card(s, 6.75, 1.55, 5.45, 4.75, { fill: C.cream });
  s.addText("Future work", { x: 7.08, y: 1.9, w: 2.8, h: 0.35, fontSize: 19, bold: true, color: C.brown, margin: 0 });
  bulletList(s, [
    "Connect scheduled CSV or real system feeds.",
    "Add authenticated users and API-backed permissions.",
    "Train forecasting models for volume, staffing need, and scan-rate risk.",
  ], 7.11, 2.55, 4.25, 2.6);
  footer(s, 9);
  slides.push(s);
}

{
  const s = pptx.addSlide();
  slideBase(s, "Conclusion", "OutboundOps turns data mining into an operational control center");
  s.addText("Final takeaway", { x: 0.85, y: 1.7, w: 3.4, h: 0.35, fontSize: 19, bold: true, color: C.brown, margin: 0 });
  s.addText("The project demonstrates full-stack development, data modeling, KPI engineering, interactive analytics, and decision support in one coherent warehouse operations application.", {
    x: 0.85,
    y: 2.25,
    w: 7.9,
    h: 1.05,
    fontSize: 22,
    bold: true,
    color: C.ink,
    margin: 0,
    fit: "shrink",
  });
  card(s, 0.85, 4.0, 3.3, 1.4, { fill: C.surface });
  s.addText("Built", { x: 1.15, y: 4.25, w: 1.2, h: 0.28, fontSize: 17, bold: true, color: C.brown, margin: 0 });
  s.addText("Flask API, SQLite model, React dashboard, reusable analytics components.", { x: 1.15, y: 4.72, w: 2.35, h: 0.36, fontSize: 9.8, color: C.muted, margin: 0, fit: "shrink" });
  card(s, 4.45, 4.0, 3.3, 1.4, { fill: C.surface });
  s.addText("Analyzed", { x: 4.75, y: 4.25, w: 1.5, h: 0.28, fontSize: 17, bold: true, color: C.brown, margin: 0 });
  s.addText(`${fmt(metrics.total_volume)} packages and ${fmt(metrics.records)} operation records.`, { x: 4.75, y: 4.72, w: 2.35, h: 0.36, fontSize: 9.8, color: C.muted, margin: 0, fit: "shrink" });
  card(s, 8.05, 4.0, 3.3, 1.4, { fill: C.surface });
  s.addText("Supported", { x: 8.35, y: 4.25, w: 1.7, h: 0.28, fontSize: 17, bold: true, color: C.brown, margin: 0 });
  s.addText("Supervisor workflows for staffing, flow, scanning, alerts, export, and daily reporting.", { x: 8.35, y: 4.72, w: 2.35, h: 0.36, fontSize: 9.8, color: C.muted, margin: 0, fit: "shrink" });
  footer(s, 10);
  slides.push(s);
}

pptx.writeFile({ fileName: outPath });
console.log(outPath);
