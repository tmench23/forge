/**
 * ForgeFit - Exercise Library Page
 */

let allExercises = [];
let activeCategory = 'all';
let activeMuscle = '';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
    initExercises();
});

async function initExercises() {
    try {
        allExercises = await API.get('/api/exercises');
        renderExercises();
        setupFilters();
        setupModal();
    } catch (e) {
        console.error('Failed to load exercises:', e);
    }
}

function setupFilters() {
    // Category filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategory = btn.dataset.category;
            renderExercises();
        });
    });

    // Muscle group dropdown
    document.getElementById('muscleFilter').addEventListener('change', (e) => {
        activeMuscle = e.target.value;
        renderExercises();
    });

    // Search
    document.getElementById('exerciseSearch').addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderExercises();
    });
}

function getFilteredExercises() {
    return allExercises.filter(ex => {
        if (activeCategory !== 'all' && ex.category !== activeCategory) return false;
        if (activeMuscle && ex.muscle_group !== activeMuscle) return false;
        if (searchQuery && !ex.name.toLowerCase().includes(searchQuery) &&
            !ex.muscle_group.toLowerCase().includes(searchQuery) &&
            !(ex.equipment || '').toLowerCase().includes(searchQuery)) return false;
        return true;
    });
}

function renderExercises() {
    const grid = document.getElementById('exerciseGrid');
    const filtered = getFilteredExercises();

    if (filtered.length === 0) {
        grid.innerHTML = '<p class="empty-state" style="grid-column:1/-1">No exercises match your filters. Try adjusting your search.</p>';
        return;
    }

    grid.innerHTML = filtered.map((ex, idx) => `
        <div class="exercise-lib-card animate-slide-up" style="animation-delay:${Math.min(idx * 0.03, 0.5)}s"
             onclick="showExerciseDetail(${ex.id})">
            <div class="exercise-lib-thumb">
                ${ex.animation_url
                    ? `<img src="${ex.animation_url}" alt="${ex.name}" loading="lazy">`
                    : `<div style="color:var(--text-muted);font-size:2rem">\uD83C\uDFCB\uFE0F</div>`}
            </div>
            <div class="exercise-lib-info">
                <h3>${ex.name}</h3>
                <p>${ex.description || ''}</p>
                <div class="exercise-lib-meta">
                    <span class="badge badge-${ex.category}">${ex.category}</span>
                    <span class="badge" style="background:var(--bg-elevated);color:var(--text-secondary)">${ex.muscle_group}</span>
                    ${ex.back_hip_focus ? '<span class="badge" style="background:rgba(6,182,212,0.1);color:var(--accent-cyan)">Back/Hip</span>' : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function showExerciseDetail(exerciseId) {
    const exercise = allExercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    document.getElementById('modalExerciseName').textContent = exercise.name;

    const visual = document.getElementById('modalVisual');
    if (exercise.animation_url) {
        visual.innerHTML = `<img src="${exercise.animation_url}" alt="Demonstration of ${exercise.name}" loading="lazy">`;
    } else {
        visual.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--text-muted)">No demonstration available</div>';
    }

    const muscle = document.getElementById('modalMuscle');
    muscle.textContent = exercise.muscle_group;
    muscle.className = 'form-guide-badge badge-' + exercise.category;

    document.getElementById('modalEquipment').textContent = exercise.equipment || 'Bodyweight';

    const diff = document.getElementById('modalDifficulty');
    diff.textContent = exercise.difficulty;
    diff.className = 'form-guide-badge badge-' + exercise.difficulty;

    document.getElementById('modalDescription').textContent = exercise.description || '';

    const cues = exercise.form_cues || [];
    document.getElementById('modalCues').innerHTML = cues.map(c => `<li>${c}</li>`).join('');

    document.getElementById('modalSets').textContent = exercise.target_sets || 3;
    document.getElementById('modalReps').textContent = exercise.is_timed
        ? `${exercise.target_duration_seconds}s`
        : exercise.target_reps || 12;

    // Load history
    loadExerciseHistory(exerciseId);

    openModal('exerciseModal');
}

async function loadExerciseHistory(exerciseId) {
    const section = document.getElementById('modalHistory');
    const content = document.getElementById('modalHistoryContent');

    try {
        const history = await API.get(`/api/logs/exercise/${exerciseId}/history`);
        if (history.length > 0) {
            section.style.display = '';
            content.innerHTML = `
                <div style="display:flex;flex-direction:column;gap:0.25rem">
                    ${history.slice(0, 10).map(h => `
                        <div style="display:flex;justify-content:space-between;padding:0.25rem 0;font-size:0.85rem;border-bottom:1px solid var(--border-color)">
                            <span>Set ${h.set_number}</span>
                            <span>${h.actual_reps || '-'} reps</span>
                            <span style="color:var(--primary-light)">${h.weight_lbs || 0} lbs</span>
                        </div>
                    `).join('')}
                </div>`;
        } else {
            section.style.display = 'none';
        }
    } catch (e) {
        section.style.display = 'none';
    }
}

function setupModal() {
    document.getElementById('exerciseModalClose').addEventListener('click', () => closeModal('exerciseModal'));
}
