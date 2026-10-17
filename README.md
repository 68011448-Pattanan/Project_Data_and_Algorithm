# Parkside — Mall Parking

A working parking-management website for mall visitors, administrators and security. Built from the supplied DS & Algorithms proposal and master prompt, adapted to a mall such as Siam Paragon or Mega Bangna. **The default capacity is 1,100 parking bays across 11 floors, 100 bays per floor.** Layouts, distances, destination names and prices are illustrative, not official mall data.

The project uses FastAPI, Python, SQLite and a responsive HTML/CSS/JavaScript frontend. 

From this folder in PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements.txt
.\.venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8002
```

Open **http://localhost:8002**. API documentation: **http://localhost:8002/docs**.

Docker Desktop alternative:

```powershell
docker compose -f docker-compose.yaml up --build -d
docker compose -f docker-compose.yaml down
```

Docker runs two servers:

| Service              | URL                                                      | Contents                                                          |
| -------------------- | -------------------------------------------------------- | ----------------------------------------------------------------- |
| `parking-api`      | http://localhost:8002 (docs: http://localhost:8002/docs) | FastAPI and its embedded SQLite database                          |
| `parking-frontend` | http://localhost:3001                                    | nginx serving`static/` and proxying `/api` to `parking-api` |

The `parking-data` named volume retains the database. Local storage is `data/parking.sqlite3`. Use exactly **one backend worker**. `Version 1` is preserved and uses a separate database.

## Stakeholder views

Select the view from the top-right dropdown:

* **Mall visitor:** enter a plate, choose a destination, get a bay and route, confirm parking, find a car, check availability and queue position.
* **Mall administrator:** view capacity and revenue, inspect all floors, manage active visits and history, analyze demand, change fees and labels, run simulations and demonstrate algorithms.
* **Security staff:** register arrivals, simulate plate detection, verify parking, record exits and fee receipts, locate vehicles, close/reopen free bays, log incidents and resolve reports.

These views demonstrate stakeholder workflows. They are not authenticated roles or API access controls. The app is bound to localhost by default.

## Simulation control mode

Open **Simulation control** from the administrator or security view, or use **Simulation tools → Open simulation control mode**. This carries forward Version 1's destination and entry/exit/generate/clear controls and adds:

1. Select a destination or random distribution, then simulate one arrival or generate 1/5/10/100 vehicles. The engine chooses a reachable open bay, or queues the arrival.
2. Use **Start traffic**, **Pause traffic**, or **Step one traffic tick**. Choose balanced arrivals/exits, arrivals only, departures only, or rush traffic, with a 2/5/10-second interval. Automatic batches are capped at 10; a queue of 100 triggers demo departures. Traffic runs while the tab stays open and pauses on role changes or page close.
3. Observe live capacity, queue counts and events. Fill, queue, clear and reset controls operate on demo data while preserving manual visits, closures, settings and incidents. Automatic and manual simulated exits affect demo vehicles only.
4. Use **Run all scenario checks** or an individual **Run case**. Each case executes actual parking-engine operations in its own disposable 11-floor database. Results show pass/fail, expected and actual checks, steps, final lot counts and elapsed runtime. They leave live parking records unchanged.

The 18 cases cover normal arrival/confirmation/lookup, duplicate plates, invalid plates, unknown vehicles, a full destination floor, all bays full, FIFO handoff after exit, cancellation of a middle waiter, closed bays, reopening, blocked routes, the free-hour fee boundary, re-entry after exit, concurrent arrivals, out-of-order stable history, database restart recovery, transaction rollback and clearing demo records while keeping manual visits.

Scenario runtimes include fixture creation, database operations and validation; they are separate from algorithm-only timings. The cases cover implemented operating conditions and failure boundaries, not every possible production integration failure.

## Folder structure

```text
app/algorithms.py     A*, Dijkstra comparison, Merge Sort, FIFOQueue, graph
app/store.py          State transitions, persistence, fees, simulation, analytics
app/main.py           Validated REST API, frontend serving
app/benchmarks.py     Repeated timings and equivalent-task comparisons
app/scenarios.py      18 isolated operational scenario checks
static/index.html     Application shell
static/styles.css     Responsive layout and map styling
static/app.js         Stakeholder workflows, SVG maps/charts, animations
static/lab-tools.js   Experiment state, simulation controls and scenario reports
static/academic.js    Academic report, methodology, measured figures and exports
static/academic.css   Report typography, responsive tables and A4 print styling
tests/test_parking.py Algorithm, transaction, concurrency and API checks
tests/test_lab_tools.py Benchmark fairness, scenario isolation and control checks
data/                 Runtime SQLite database (ignored by Git)
start.ps1             Windows launcher
Dockerfile            Container build
docker-compose.yaml   API + database server and nginx frontend server
nginx/default.conf    Frontend static files and /api proxy
REQUIREMENTS.md        Coverage and prototype limitations
```

## Test

```powershell
.\.venv\Scripts\python -m pip install -r requirements-dev.txt
.\.venv\Scripts\python -m unittest discover -s tests -v
node --check static/app.js
node --check static/lab-tools.js
node --check static/academic.js
docker compose -f docker-compose.yaml config --quiet
```
