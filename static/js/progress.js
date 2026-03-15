/**
 * ForgeFit - Progress Tracking Page
 */

document.addEventListener('DOMContentLoaded', () => {
    initProgress();
});

async function initProgress() {
    await Promise.all([
        loadProgressSummary(),
        loadWorkoutHistory(),
        loadPersonalRecords(),
        loadMetrics(),
    ]);
    setupMetricModal();
}

async function loadProgressSummary() {
    try {
        const summary = await API.get('/api/progress/summary');
        document.getElementById('progTotalWorkouts').textContent = summary.total_workouts || 0;
        document.getElementById('progTotalMinutes').textContent = summary.total_minutes || 0;
        document.getElementById('progLongestStreak').textContent = summary.streak.longest_streak || 0;
    } catch (e) {
        console.error('Failed to load summary:', e);
    }
}

async function loadWorkoutHistory() {
    try {
        const sessions = await API.get('/api/sessions?limit=20');
        const container = document.getElementById('workoutHistory');

        if (sessions.length === 0) return;

        container.innerHTML = sessions.map(s => {
            const stars = s.rating ? '\u2B50'.repeat(s.rating) : '';
            return `
                <div class="history-item">
                    <span class="history-date">${formatDate(s.date)}</span>
                    <span class="badge badge-${s.workout_type}" style="flex-shrink:0">${s.workout_type}</span>
                    <span class="history-name">${s.workout_name}</span>
                    <span class="history-duration">${s.duration_minutes ? formatDuration(s.duration_minutes) : '-'}</span>
                    <span class="history-rating">${stars}</span>
                    <span style="font-size:0.85rem;color:${s.completed ? 'var(--accent-green)' : 'var(--text-muted)'}">${s.completed ? '\u2713 Done' : 'Incomplete'}</span>
                </div>`;
        }).join('');
    } catch (e) {
        console.error('Failed to load history:', e);
    }
}

async function loadPersonalRecords() {
    try {
        const prs = await API.get('/api/personal-records');
        const grid = document.getElementById('prGrid');

        if (prs.length === 0) return;

        grid.innerHTML = prs.map(pr => `
            <div class="pr-item">
                <div class="pr-icon">\uD83C\uDFC6</div>
                <div class="pr-info">
                    <h4>${pr.exercise_name}</h4>
                    <p>${pr.record_type === 'max_weight' ? 'Max Weight' : pr.record_type} \u2022 ${formatDate(pr.achieved_date)}</p>
                </div>
                <div class="pr-value">${pr.value} ${pr.record_type === 'max_weight' ? 'lbs' : ''}</div>
            </div>
        `).join('');
    } catch (e) {
        console.error('Failed to load PRs:', e);
    }
}

async function loadMetrics() {
    try {
        const metrics = await API.get('/api/metrics');
        const container = document.getElementById('metricsChart');

        if (metrics.length === 0) return;

        // Simple visual chart using CSS bars
        const maxWeight = Math.max(...metrics.map(m => m.weight_lbs || 0));
        const minWeight = Math.min(...metrics.filter(m => m.weight_lbs).map(m => m.weight_lbs));
        const range = maxWeight - minWeight || 1;

        container.innerHTML = `
            <div style="display:flex;flex-direction:column;gap:0.5rem">
                <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--text-muted);margin-bottom:0.5rem">
                    <span>Date</span>
                    <span>Weight (lbs)</span>
                </div>
                ${metrics.reverse().map(m => {
                    const pct = m.weight_lbs ? ((m.weight_lbs - minWeight) / range) * 100 : 0;
                    return `
                        <div style="display:flex;align-items:center;gap:1rem">
                            <span style="min-width:80px;font-size:0.8rem;color:var(--text-muted)">${formatDate(m.date)}</span>
                            <div style="flex:1;height:24px;background:var(--bg-primary);border-radius:var(--radius-sm);overflow:hidden">
                                <div style="width:${Math.max(pct, 5)}%;height:100%;background:linear-gradient(90deg,var(--primary),var(--accent-cyan));border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:flex-end;padding-right:0.5rem">
                                    <span style="font-size:0.75rem;font-weight:600;color:white">${m.weight_lbs || '-'}</span>
                                </div>
                            </div>
                        </div>`;
                }).join('')}
            </div>`;
    } catch (e) {
        console.error('Failed to load metrics:', e);
    }
}

function setupMetricModal() {
    document.getElementById('addMetricBtn').addEventListener('click', () => {
        document.getElementById('metricDate').value = getTodayISO();
        openModal('metricModal');
    });
    document.getElementById('metricModalClose').addEventListener('click', () => closeModal('metricModal'));
    document.getElementById('metricModalCancel').addEventListener('click', () => closeModal('metricModal'));
    document.getElementById('metricModalSave').addEventListener('click', saveMetric);
}

async function saveMetric() {
    const data = {
        date: document.getElementById('metricDate').value,
        weight_lbs: parseFloat(document.getElementById('metricWeight').value) || null,
        body_fat_pct: parseFloat(document.getElementById('metricBodyFat').value) || null,
        notes: document.getElementById('metricNotes').value,
    };

    if (!data.date) {
        showToast('Please enter a date', 'error');
        return;
    }

    try {
        await API.post('/api/metrics', data);
        showToast('Metrics saved!', 'success');
        closeModal('metricModal');
        loadMetrics();
    } catch (e) {
        showToast('Failed to save metrics', 'error');
    }
}
