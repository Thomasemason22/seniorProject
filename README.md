# OutboundOps Dashboard

A Flask and React dashboard for outbound operations analytics. It tracks gross volume, scanned volume, staffing, paid day, overtime, PPH, planned hours, and belt-level performance across unload, outbounds, airsort, sort aisle, small sort, irregulars, indirect, and metro areas.

## Features

- Flask API with SQLite storage
- React dashboard with filters for shift, area group, belt, date range, and search
- Gross vs scanned volume charts
- Outbound PD belt scan/gross table
- Belt staffing coverage matrix
- Area leaderboard and operational risk panel
- Seed data for UL 1-6, PD 1-18, SRT 1-6, Metro 1-4, and supporting areas

## Backend Setup

```bash
python3 -m pip install -r requirements.txt
python3 seed_data.py
python3 app
```

The API runs at `http://127.0.0.1:5000`.

## Frontend Setup

```bash
cd frontend
npm install
npm start
```

The dashboard runs at `http://127.0.0.1:3000`.

## Checks

```bash
cd frontend
npm test -- --watchAll=false
npm run build
```
