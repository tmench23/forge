/**
 * ForgeFit - Dashboard Page
 */

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

async function initDashboard() {
    // Set greeting
    document.getElementById('greeting').textContent = getGreeting();
    document.getElementById('todayDate').textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    // Load all data in parallel
    await Promise.all([
        loadQuote(),
        loadTodayWorkout(),
        loadStats(),
        loadCalendar(),
        loadTemplates(),
    ]);
}

async function loadQuote() {
    try {
        const quote = await API.get('/api/quote');
        document.getElementById('quoteText').textContent = `"${quote.quote}"`;
        document.getElementById('quoteAuthor').textContent = `\u2014 ${quote.author}`;
    } catch (e) {
        console.error('Failed to load quote:', e);
    }
}

async function loadTodayWorkout() {
    try {
        const today = await API.get('/api/today');
        const card = document.getElementById('todayCard');

        if (today.completed_today) {
            card.innerHTML = `
                <div class="today-completed animate-slide-up">
                    <div class="today-completed-icon">\u2705</div>
                    <h3>Today's workout is done!</h3>
                    <p style="color:var(--text-secondary);margin-top:0.5rem">Great job! Rest up and come back tomorrow.</p>
                </div>`;
            return;
        }

        if (today.schedule) {
            const s = today.schedule;
            const templateId = s.template_id;

            card.innerHTML = `
                <div class="today-card-content animate-slide-up">
                    <div class="today-card-info">
                        <h3>${s.workout_name}</h3>
                        <p>${s.description || ''}</p>
                        <div class="today-card-badges">
                            <span class="badge badge-${s.workout_type}">${s.workout_type}</span>
                            <span class="badge" style="background:var(--bg-elevated);color:var(--text-secondary)">${today.day_name}</span>
                        </div>
                        ${templateId ? `<a href="/workout/${templateId}" class="btn btn-primary">Start Workout \u2192</a>` : ''}
                    </div>
                </div>`;
        } else {
            card.innerHTML = `
                <div class="today-card-content animate-slide-up">
                    <div class="today-card-info">
                        <h3>No workout scheduled</h3>
                        <p>Enjoy your rest day, or pick a quick workout below!</p>
                    </div>
                </div>`;
        }
    } catch (e) {
        console.error('Failed to load today:', e);
    }
}

async function loadStats() {
    try {
        const summary = await API.get('/api/progress/summary');
        document.getElementById('currentStreak').textContent = summary.streak.current_streak || 0;
        document.getElementById('totalWorkouts').textContent = summary.total_workouts || 0;
        document.getElementById('totalMinutes').textContent = summary.total_minutes || 0;
        document.getElementById('thisWeek').textContent = summary.this_week_count || 0;

        // Animate stat values
        document.querySelectorAll('.stat-card').forEach((card, i) => {
            card.style.animation = `slideUp 0.4s ease ${i * 0.1}s both`;
        });

        // PRs
        const prList = document.getElementById('prList');
        if (summary.recent_prs && summary.recent_prs.length > 0) {
            prList.innerHTML = summary.recent_prs.map(pr => `
                <div class="pr-item animate-slide-up">
                    <div class="pr-icon">\uD83C\uDFC6</div>
                    <div class="pr-info">
                        <h4>${pr.exercise_name}</h4>
                        <p>${formatDate(pr.achieved_date)}</p>
                    </div>
                    <div class="pr-value">${pr.value} lbs</div>
                </div>
            `).join('');
        }
    } catch (e) {
        console.error('Failed to load stats:', e);
    }
}

async function loadCalendar() {
    try {
        const calData = await API.get('/api/calendar');
        const heatmap = document.getElementById('calendarHeatmap');

        // Generate last 12 weeks (84 days)
        const today = new Date();
        const days = [];
        for (let i = 83; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            days.push(d);
        }

        heatmap.innerHTML = days.map(d => {
            const key = d.toISOString().split('T')[0];
            const dayData = calData[key];
            const count = dayData ? dayData.count : 0;
            let level = 'level-0';
            if (count === 1) level = 'level-1';
            else if (count === 2) level = 'level-2';
            else if (count >= 3) level = 'level-3';

            const dayName = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const tooltip = count > 0 ? `${dayName}: ${count} workout${count > 1 ? 's' : ''}` : dayName;

            return `<div class="calendar-day ${count > 0 ? level : ''}" data-tooltip="${tooltip}"></div>`;
        }).join('');
    } catch (e) {
        console.error('Failed to load calendar:', e);
    }
}

async function loadTemplates() {
    try {
        const templates = await API.get('/api/templates');
        const grid = document.getElementById('templateGrid');

        grid.innerHTML = templates.map(t => `
            <a href="/workout/${t.id}" class="template-card animate-slide-up">
                <div class="template-card-header">
                    <h3>${t.name}</h3>
                    <span class="badge badge-${t.workout_type}">${t.workout_type}</span>
                </div>
                <p>${t.description}</p>
                <div class="template-card-footer">
                    <span class="template-card-count">${t.exercises.length} exercises</span>
                    <span class="btn btn-sm btn-outline">Start \u2192</span>
                </div>
            </a>
        `).join('');
    } catch (e) {
        console.error('Failed to load templates:', e);
    }
}
