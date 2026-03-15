# ForgeFit - Home Workout Companion

A full-stack web app for tracking home workouts with strength training, mobility/flexibility, and cardio programs. Built for someone with adjustable dumbbells, a bench, and door-anchor resistance bands who wants to address back/hip tightness while building overall fitness.

![Python](https://img.shields.io/badge/Python-3.11+-blue)
![Flask](https://img.shields.io/badge/Flask-3.0+-green)
![SQLite](https://img.shields.io/badge/Database-SQLite-lightgrey)

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run the app
python3 app.py
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

## Features

### Dashboard
- Daily workout recommendation based on your weekly schedule
- Streak counter, total workouts, total minutes, and weekly summary
- 12-week activity heatmap calendar
- Quick-start cards for all workout templates
- Rotating motivational quotes

### Weekly Schedule
- Pre-configured 7-day plan balancing strength, mobility, cardio, and rest
- Editable per day with template suggestions
- Visual color coding by workout type

### Workout Templates
| Template | Type | Focus |
|----------|------|-------|
| Upper Body Strength | Strength | Chest, back, shoulders, arms |
| Lower Body Strength | Strength | Legs, glutes, core |
| Full Body Strength | Strength | All major muscle groups |
| Back & Hip Mobility | Mobility | Targeted back/hip flexibility |
| Full Body Mobility | Mobility | All joints and muscle groups |
| HIIT Cardio Blast | Cardio | High-intensity intervals |
| Strength & Mobility Combo | Strength | Balanced strength + mobility |

### Exercise Library
- **44 exercises** across strength, mobility, and cardio categories
- Animated GIF demonstrations for every exercise
- Step-by-step form cues to ensure proper technique
- Filters by category, muscle group, and search
- Exercises tagged as "Back/Hip Focus" for targeted relief

### Active Workout Tracker
- Built-in session timer
- Per-set logging of reps, weight (lbs), and duration
- Visual progress bar showing workout completion
- Form guide modal accessible for each exercise during the workout
- Post-workout rating and notes

### Progress Tracking
- Workout history with dates, durations, and ratings
- Automatic personal record detection (max weight per exercise)
- Body metrics logging (weight, body fat %)
- Visual metrics chart

### Motivation System
- **Streak tracking** - current and longest streaks
- **12 achievements** unlocked through milestones:
  - Workout count (1, 5, 10, 25, 50, 100)
  - Streak length (3, 7, 14, 30 days)
  - Total exercise time (60, 600 minutes)
- **15 motivational quotes** displayed on the dashboard

## Architecture

### Tech Stack
- **Backend:** Python / Flask
- **Frontend:** Vanilla HTML, CSS, JavaScript (no frameworks)
- **Database:** SQLite via Flask-SQLAlchemy
- **Styling:** Custom CSS with dark theme, CSS custom properties, responsive design

### Database Layout

Four separate SQLite databases organized by concern:

| Database | Tables | Purpose |
|----------|--------|---------|
| `workout_core.db` | `workout_schedule`, `workout_sessions` | Weekly schedule and session tracking |
| `exercise_library.db` | `exercises`, `workout_templates` | Exercise definitions and workout programs |
| `progress_tracking.db` | `exercise_logs`, `personal_records`, `body_metrics` | All progress data |
| `motivation.db` | `achievements`, `motivational_quotes`, `streaks` | Gamification and motivation |

Databases are auto-created and seeded on first run. They live in the `databases/` directory and are gitignored so your personal data stays local.

### Project Structure

```
forge/
├── app.py                  # Flask app, models, API routes, seed data
├── requirements.txt        # Python dependencies
├── databases/              # SQLite databases (auto-generated)
├── static/
│   ├── css/
│   │   └── style.css       # All styles - dark theme, responsive
│   └── js/
│       ├── app.js           # Shared utilities, nav, API helpers, toasts
│       ├── dashboard.js     # Dashboard page logic
│       ├── schedule.js      # Schedule page logic
│       ├── workout.js       # Active workout tracking
│       ├── exercises.js     # Exercise library browsing
│       ├── exercise_detail.js  # Individual exercise view
│       ├── progress.js      # Progress tracking page
│       └── achievements.js  # Achievements page
└── templates/
    ├── base.html            # Layout with nav and shared structure
    ├── dashboard.html       # Home page
    ├── schedule.html        # Weekly schedule editor
    ├── workout.html         # Active workout session
    ├── exercises.html       # Exercise library
    ├── exercise_detail.html # Single exercise view
    ├── progress.html        # Progress and history
    └── achievements.html    # Achievement badges
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/schedule` | Get weekly schedule |
| POST | `/api/schedule` | Update weekly schedule |
| GET | `/api/today` | Get today's scheduled workout |
| GET | `/api/exercises` | List exercises (filterable by category/muscle) |
| GET | `/api/exercises/:id` | Get single exercise |
| GET | `/api/templates` | List workout templates with exercises |
| GET | `/api/templates/:id` | Get single template with exercises |
| GET | `/api/sessions` | List workout sessions |
| POST | `/api/sessions` | Create a workout session |
| PUT | `/api/sessions/:id` | Update a session (complete, rate, notes) |
| POST | `/api/logs` | Log an exercise set |
| PUT | `/api/logs/:id` | Update a logged set |
| GET | `/api/logs/session/:id` | Get logs for a session |
| GET | `/api/logs/exercise/:id/history` | Get history for an exercise |
| GET | `/api/progress/summary` | Get overall progress stats |
| GET | `/api/personal-records` | List all personal records |
| GET | `/api/metrics` | Get body metrics history |
| POST | `/api/metrics` | Log body metrics |
| GET | `/api/streak` | Get current streak info |
| GET | `/api/achievements` | List all achievements |
| GET | `/api/quote` | Get a random motivational quote |
| GET | `/api/calendar` | Get 12-week activity heatmap data |

## Equipment Assumed

- Adjustable dumbbells (full set)
- Flat/incline bench
- Resistance bands with door anchor
- Bodyweight (no additional equipment needed for many exercises)
