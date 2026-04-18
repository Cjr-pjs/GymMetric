# GymMetric 🏋

> **The facilitator of your exercise routine.**

GymMetric is a lightweight, client-side web application for planning and tracking your gym workouts. All data is stored locally in your browser — no account or server required.

---

## Features

| Feature | Description |
|---|---|
| **Routine Builder** | Create named workout routines with exercises, sets, reps, and target weights. |
| **Live Workout Session** | Start any routine and log each set in real time with a built-in timer. |
| **Workout History** | Browse every completed session with full exercise and set details. |
| **Dashboard Stats** | At-a-glance view of total workouts, weekly activity, and average session length. |
| **Exercise Library** | 60+ built-in exercises organized by muscle group and equipment, with search and filters. |

---

## Getting Started

GymMetric is a static web application — no build step required.

1. Clone the repository:
   ```bash
   git clone https://github.com/Cjr-pjs/GymMetric-.git
   cd GymMetric-
   ```

2. Open `index.html` directly in your browser, **or** serve it with any static file server:
   ```bash
   # Using Python
   python3 -m http.server 8080
   # Using Node.js npx
   npx serve .
   ```

3. Navigate to `http://localhost:8080` and start building your routines!

---

## Project Structure

```
GymMetric-/
├── index.html          # Main entry point
├── css/
│   └── style.css       # Application styles
└── js/
    ├── exercises.js    # Built-in exercise database (60+ exercises)
    ├── storage.js      # localStorage persistence layer
    ├── workout.js      # Routine & workout management logic
    └── app.js          # UI controller and event handling
```

---

## Usage

### Create a Routine
1. Go to **Routines → New Routine**
2. Give it a name (e.g. *Push Day*)
3. Click **Add Exercise** and fill in exercise name, sets, reps, and optional weight
4. Click **Save Routine**

### Start a Workout
1. On the **Routines** page, click **▶ Start** next to any routine
2. For each exercise, enter reps and weight then click **+ Log Set**
3. When done, click **✓ Finish & Save**

### View History
All completed sessions appear on the **History** page with timestamps, duration, and set-by-set detail.

---

## Technology

- **Vanilla HTML/CSS/JavaScript** — zero dependencies, zero build tooling
- **localStorage** for client-side data persistence
- Responsive layout for desktop and mobile browsers
