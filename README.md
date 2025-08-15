# F1 Race Weekend Web App (FastF1 + React)

A full-stack Formula 1 race-weekend explorer. The backend wraps **FastF1** with tidy endpoints for race/qualifying/pit-stops/positions and circuit details. The frontend (React + TypeScript) renders clean tables, an interactive positions chart, and a compact circuit info card enriched from `circuits.csv`.

> **Status:** MVP complete — race results, qualifying, pit stops, positions, and circuit details are live.

---

## ✨ Features (built so far)

- **FastAPI backend on FastF1**
  - Endpoints for: race list, race summary (classification + times), qualifying (Q1/Q2/Q3), pit stops, lap-by-lap positions.
  - Circuit details endpoint merges FastF1 event metadata with our `circuits.csv` (alias/fuzzy matching ready).
  - Consistent response schemas, display-ready time formatting, local FastF1 cache.

- **Typed React frontend**
  - Year + Grand Prix selectors → one-click **Show Results**.
  - Components: `RaceResultsViewer`, `QualifyingResultsViewer`, `PitstopsViewer`, `RacePositionsChart`, `CircuitInfoCard`.
  - Positions chart with driver toggles and reversed Y-axis (P1 on top).
  - Tailwind styling; responsive layout.

- **Circuit enrichment via CSV**
  - Uses `circuits.csv` columns (`circuitRef`, `name`, `location`, `country`, `lat`, `lng`, `alt`, `url`).
  - Gracefully supports optional `length_km`, `turns`, `layout_img_url`.

---

## 🧱 Tech Stack

- **Backend:** Python, FastAPI, FastF1, pandas
- **Frontend:** React, TypeScript, Vite, Tailwind, Recharts
- **Data:** `circuits.csv` (Ergast-style circuits)

---


---

## ⚡ Quick Start

### 1) Backend

**Prereqs:** Python 3.10+

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install fastapi uvicorn fastf1 pandas python-multipart
python setup_fastf1.py   # creates ./cache and enables fastf1.Cache
uvicorn main:app --reload --port 8000
```

API Overview

Race

GET /race/{year}/races
List of events for the year.

GET /race/{year}/{gp_name}
Race summary (classification).
Example item:

```bash

{
  "driver_number": "1",
  "driver_name": "Max Verstappen",
  "abbreviation": "VER",
  "team": "Red Bull Racing",
  "laps": 78,
  "avg_laptime": "1:23.700",
  "status": "Finished",
  "position": 1
}
```

GET /race/{year}/{gp_name}/qualifying
Q1/Q2/Q3 times normalized to m:ss.xxx.

GET /race/{year}/{gp_name}/pitstops
Stop lap, in/out times, duration; tyre before/after when derivable.

GET /race/{year}/{gp_name}/positions
Lap-by-lap running positions per driver (for charting).

Circuit

GET /circuit/{year}/{gp_name}/details
Merges FastF1 metadata with circuits.csv.
Fields: circuit, display_location, lat, lng, alt, wiki_url, optional length_km, turns, layout_img_url, and fastest_laps.

Tip: if event keys differ from circuits.csv circuitRef, add overrides in circuit_service.py.

.

🖥️ Frontend Components

RaceResultsViewer — clean race table with normalized times.

QualifyingResultsViewer — compact Q1/Q2/Q3 view with fallbacks.

PitstopsViewer — team accents, tyre badges, and durations.

RacePositionsChart — lap positions (Recharts), driver toggles, P1-top Y-axis.

CircuitInfoCard — track name, location, optional length/turns, fastest quali/race laps.

🛠️ Development Notes

Caching: First calls per session/year download data; subsequent loads are fast via local FastF1 cache (./cache).

CORS: Update allowed origins in main.py if your frontend host/port differs.

Names/Aliases: Maintain event-to-circuit alias overrides in ALIAS_OVERRIDES inside circuit_service.py.

🙏 Acknowledgements

FastF1 — F1 telemetry & timing data
