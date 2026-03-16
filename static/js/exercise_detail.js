/**
 * ForgeFit - Exercise Detail Page
 */

document.addEventListener('DOMContentLoaded', () => {
    loadExerciseDetail();
});

async function loadExerciseDetail() {
    try {
        const ex = await API.get(`/api/exercises/${EXERCISE_ID}`);
        const card = document.getElementById('exerciseDetail');

        card.innerHTML = `
            <div class="exercise-detail-hero">
                <div class="exercise-detail-visual">
                    ${ex.animation_url
                        ? `<img src="${ex.animation_url}" alt="Demonstration of ${ex.name}" loading="lazy">`
                        : '<div style="font-size:4rem;color:var(--text-muted)">\uD83C\uDFCB\uFE0F</div>'}
                <div class="exercise-detail-info">
                    <h1>${ex.name}</h1>
                    <div class="exercise-detail-badges">
                        <span class="badge badge-${ex.category}">${ex.category}</span>
                        <span class="badge" style="background:var(--bg-elevated);color:var(--text-secondary)">${ex.muscle_group}</span>
                        <span class="badge badge-${ex.difficulty}">${ex.difficulty}</span>
                        <span class="badge" style="background:var(--bg-elevated);color:var(--text-secondary)">${ex.equipment || 'Bodyweight'}</span>
                        ${ex.back_hip_focus ? '<span class="badge" style="background:rgba(6,182,212,0.1);color:var(--accent-cyan)">Back/Hip Focus</span>' : ''}
                    </div>
                    <p class="exercise-detail-desc">${ex.description || ''}</p>
                    <h2>Form Cues</h2>
                    <ol class="form-cues-list">
                        ${(ex.form_cues || []).map(c => `<li>${c}</li>`).join('')}
                    </ol>
                    <div class="modal-exercise-stats" style="margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid var(--border-color)">
                        <div class="exercise-stat">
                            <span class="exercise-stat-label">Recommended Sets</span>
                            <span class="exercise-stat-value">${ex.target_sets || 3}</span>
                        </div>
                        <div class="exercise-stat">
                            <span class="exercise-stat-label">${ex.is_timed ? 'Duration' : 'Reps'}</span>
                            <span class="exercise-stat-value">${ex.is_timed ? (ex.target_duration_seconds + 's') : (ex.target_reps || 12)}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div id="historySection" style="padding:1.5rem 2rem"></div>`;

        // Load history
        loadHistory();
    } catch (e) {
        document.getElementById('exerciseDetail').innerHTML =
            '<p style="padding:2rem;color:var(--accent-red)">Exercise not found.</p>';
    }
}

async function loadHistory() {
    try {
        const history = await API.get(`/api/logs/exercise/${EXERCISE_ID}/history`);
        const section = document.getElementById('historySection');

        if (history.length > 0) {
            section.innerHTML = `
                <h2 style="font-size:1.1rem;font-weight:700;margin-bottom:1rem;color:var(--primary-light)">Your History</h2>
                <div style="display:flex;flex-direction:column;gap:0.5rem">
                    ${history.map(h => `
                        <div style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid var(--border-color);font-size:0.9rem">
                            <span style="color:var(--text-muted)">Set ${h.set_number}</span>
                            <span>${h.actual_reps || '-'} reps</span>
                            <span style="color:var(--primary-light);font-weight:600">${h.weight_lbs || 0} lbs</span>
                        </div>
                    `).join('')}
                </div>`;
        }
    } catch (e) {
        // History is optional
    }
}
