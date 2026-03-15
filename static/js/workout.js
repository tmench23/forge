/**
 * ForgeFit - Active Workout Page
 * Handles exercise logging, timer, progress tracking, and form guides
 */

let workoutData = null;
let sessionId = null;
let timerInterval = null;
let timerSeconds = 0;
let timerRunning = false;
let completedSets = {};
let sessionRating = 0;

document.addEventListener('DOMContentLoaded', () => {
    initWorkout();
});

async function initWorkout() {
    try {
        workoutData = await API.get(`/api/templates/${TEMPLATE_ID}`);
        renderWorkoutHeader();
        renderExercises();
        setupTimer();
        await createSession();
    } catch (e) {
        console.error('Failed to load workout:', e);
        document.getElementById('workoutHeader').innerHTML = '<p style="padding:2rem;color:var(--accent-red)">Failed to load workout. Please try again.</p>';
    }
}

function renderWorkoutHeader() {
    document.getElementById('workoutName').textContent = workoutData.name;
    document.getElementById('workoutDescription').textContent = workoutData.description || '';
    const typeEl = document.getElementById('workoutType');
    typeEl.textContent = workoutData.workout_type;
    typeEl.className = `workout-badge badge-${workoutData.workout_type}`;
    document.getElementById('exerciseCount').textContent = `${workoutData.exercises.length} exercises`;
}

function renderExercises() {
    const list = document.getElementById('exerciseList');
    list.innerHTML = workoutData.exercises.map((ex, idx) => {
        const isTimed = ex.is_timed;
        const sets = ex.target_sets || 3;

        let setsHtml;
        if (isTimed) {
            const duration = ex.target_duration_seconds || 30;
            setsHtml = `
                <div class="set-table-header timed">
                    <div>Set</div>
                    <div>Duration</div>
                    <div>Done</div>
                </div>
                ${Array.from({length: sets}, (_, s) => `
                    <div class="set-row timed" data-exercise="${ex.id}" data-set="${s + 1}">
                        <div class="set-number">Set ${s + 1}</div>
                        <div>
                            <input type="number" class="set-input duration-input" value="${duration}" data-field="duration" placeholder="${duration}s">
                        </div>
                        <div class="set-check">
                            <button class="set-check-btn" onclick="toggleSet(${ex.id}, ${s + 1}, this)" title="Mark complete">\u2713</button>
                        </div>
                    </div>
                `).join('')}`;
        } else {
            setsHtml = `
                <div class="set-table-header">
                    <div>Set</div>
                    <div>Target</div>
                    <div>Reps</div>
                    <div>Weight</div>
                    <div>Done</div>
                </div>
                ${Array.from({length: sets}, (_, s) => `
                    <div class="set-row" data-exercise="${ex.id}" data-set="${s + 1}">
                        <div class="set-number">Set ${s + 1}</div>
                        <div style="color:var(--text-muted);font-size:0.85rem">${ex.target_reps} reps</div>
                        <div>
                            <input type="number" class="set-input reps-input" value="${ex.target_reps}" data-field="reps" placeholder="Reps">
                        </div>
                        <div>
                            <input type="number" class="set-input weight-input" value="" data-field="weight" placeholder="lbs" step="2.5">
                        </div>
                        <div class="set-check">
                            <button class="set-check-btn" onclick="toggleSet(${ex.id}, ${s + 1}, this)" title="Mark complete">\u2713</button>
                        </div>
                    </div>
                `).join('')}`;
        }

        return `
            <div class="exercise-card animate-slide-up" id="exercise-${ex.id}" style="animation-delay:${idx * 0.05}s">
                <div class="exercise-card-header" onclick="toggleExerciseBody(${ex.id})">
                    <div class="exercise-card-title">
                        <div class="exercise-card-number">${idx + 1}</div>
                        <div>
                            <h3>${ex.name}</h3>
                            <span style="font-size:0.8rem;color:var(--text-muted)">${ex.muscle_group} \u2022 ${ex.equipment || 'Bodyweight'}</span>
                        </div>
                    </div>
                    <div class="exercise-card-badges">
                        <span class="badge badge-${ex.difficulty}">${ex.difficulty}</span>
                        <button class="form-guide-btn" onclick="event.stopPropagation(); openFormGuide(${ex.id})">
                            \uD83D\uDCF7 Form Guide
                        </button>
                    </div>
                </div>
                <div class="exercise-card-body" id="body-${ex.id}">
                    <div class="set-table">
                        ${setsHtml}
                    </div>
                </div>
            </div>`;
    }).join('');
}

function toggleExerciseBody(exerciseId) {
    const body = document.getElementById(`body-${exerciseId}`);
    if (body.style.display === 'none') {
        body.style.display = '';
    } else {
        body.style.display = 'none';
    }
}

// ── Set Completion ──
async function toggleSet(exerciseId, setNum, btn) {
    const key = `${exerciseId}-${setNum}`;
    const row = btn.closest('.set-row');
    const exercise = workoutData.exercises.find(e => e.id === exerciseId);

    if (completedSets[key]) {
        // Uncheck
        btn.classList.remove('checked');
        delete completedSets[key];
    } else {
        // Check - log the set
        btn.classList.add('checked');

        const logData = {
            session_id: sessionId,
            exercise_id: exerciseId,
            exercise_name: exercise.name,
            set_number: setNum,
            target_reps: exercise.target_reps,
            completed: true,
        };

        // Get input values
        const repsInput = row.querySelector('.reps-input');
        const weightInput = row.querySelector('.weight-input');
        const durationInput = row.querySelector('.duration-input');

        if (repsInput) logData.actual_reps = parseInt(repsInput.value) || 0;
        if (weightInput) logData.weight_lbs = parseFloat(weightInput.value) || 0;
        if (durationInput) logData.duration_seconds = parseInt(durationInput.value) || 0;

        try {
            const result = await API.post('/api/logs', logData);
            completedSets[key] = result.id;
        } catch (e) {
            console.error('Failed to log set:', e);
            showToast('Failed to save set', 'error');
            btn.classList.remove('checked');
            return;
        }
    }

    updateProgress();
    checkExerciseComplete(exerciseId);
}

function checkExerciseComplete(exerciseId) {
    const exercise = workoutData.exercises.find(e => e.id === exerciseId);
    const sets = exercise.target_sets || 3;
    let allDone = true;
    for (let s = 1; s <= sets; s++) {
        if (!completedSets[`${exerciseId}-${s}`]) {
            allDone = false;
            break;
        }
    }

    const card = document.getElementById(`exercise-${exerciseId}`);
    if (allDone) {
        card.classList.add('completed');
    } else {
        card.classList.remove('completed');
    }
}

function updateProgress() {
    const totalSets = workoutData.exercises.reduce((sum, ex) => sum + (ex.target_sets || 3), 0);
    const completedCount = Object.keys(completedSets).length;
    const pct = totalSets > 0 ? Math.round((completedCount / totalSets) * 100) : 0;

    document.getElementById('workoutProgressFill').style.width = pct + '%';
    document.getElementById('workoutProgressText').textContent = `${pct}% complete`;

    // Check if workout is complete
    if (pct === 100) {
        showWorkoutComplete();
    }
}

// ── Timer ──
function setupTimer() {
    document.getElementById('timerStart').addEventListener('click', startTimer);
    document.getElementById('timerPause').addEventListener('click', pauseTimer);
    document.getElementById('timerReset').addEventListener('click', resetTimer);
}

function startTimer() {
    if (timerRunning) return;
    timerRunning = true;
    document.getElementById('timerStart').style.display = 'none';
    document.getElementById('timerPause').style.display = '';
    document.getElementById('timerReset').style.display = '';

    timerInterval = setInterval(() => {
        timerSeconds++;
        updateTimerDisplay();
    }, 1000);
}

function pauseTimer() {
    timerRunning = false;
    clearInterval(timerInterval);
    document.getElementById('timerStart').style.display = '';
    document.getElementById('timerStart').textContent = 'Resume';
    document.getElementById('timerPause').style.display = 'none';
}

function resetTimer() {
    timerRunning = false;
    clearInterval(timerInterval);
    timerSeconds = 0;
    updateTimerDisplay();
    document.getElementById('timerStart').style.display = '';
    document.getElementById('timerStart').textContent = 'Start Timer';
    document.getElementById('timerPause').style.display = 'none';
    document.getElementById('timerReset').style.display = 'none';
}

function updateTimerDisplay() {
    const mins = Math.floor(timerSeconds / 60);
    const secs = timerSeconds % 60;
    document.getElementById('timerDisplay').textContent =
        `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// ── Session Management ──
async function createSession() {
    try {
        const result = await API.post('/api/sessions', {
            workout_type: workoutData.workout_type,
            workout_name: workoutData.name,
            date: getTodayISO(),
        });
        sessionId = result.id;
    } catch (e) {
        console.error('Failed to create session:', e);
    }
}

// ── Workout Complete ──
function showWorkoutComplete() {
    pauseTimer();
    document.getElementById('workoutComplete').style.display = '';
    document.getElementById('completeDuration').textContent = Math.round(timerSeconds / 60) || 1;
    document.getElementById('completeExercises').textContent = workoutData.exercises.length;
    document.getElementById('completeSets').textContent = Object.keys(completedSets).length;

    // Rating stars
    document.querySelectorAll('.rating-star').forEach(star => {
        star.addEventListener('click', () => {
            sessionRating = parseInt(star.dataset.rating);
            document.querySelectorAll('.rating-star').forEach((s, i) => {
                s.classList.toggle('active', i < sessionRating);
            });
        });
    });

    // Finish button
    document.getElementById('finishWorkout').addEventListener('click', finishWorkout);

    // Scroll to complete section
    document.getElementById('workoutComplete').scrollIntoView({ behavior: 'smooth' });

    showToast('Workout complete! Great job!', 'success', 5000);
}

async function finishWorkout() {
    if (!sessionId) return;

    try {
        await API.put(`/api/sessions/${sessionId}`, {
            completed: true,
            duration_minutes: Math.round(timerSeconds / 60) || 1,
            rating: sessionRating || null,
            notes: document.getElementById('sessionNotes').value,
        });
        showToast('Workout saved!', 'success');
        setTimeout(() => { window.location.href = '/'; }, 1500);
    } catch (e) {
        showToast('Failed to save workout', 'error');
    }
}

// ── Form Guide ──
function openFormGuide(exerciseId) {
    const exercise = workoutData.exercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    document.getElementById('formGuideName').textContent = exercise.name;

    const visual = document.getElementById('formGuideVisual');
    if (exercise.animation_url) {
        visual.innerHTML = `<img src="${exercise.animation_url}" alt="Demonstration of ${exercise.name}" loading="lazy">`;
    } else {
        visual.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--text-muted)">No demonstration available</div>';
    }

    const muscle = document.getElementById('formGuideMuscle');
    muscle.textContent = exercise.muscle_group;
    muscle.className = 'form-guide-badge badge-' + exercise.category;

    const equip = document.getElementById('formGuideEquipment');
    equip.textContent = exercise.equipment || 'Bodyweight';

    const diff = document.getElementById('formGuideDifficulty');
    diff.textContent = exercise.difficulty;
    diff.className = 'form-guide-badge badge-' + exercise.difficulty;

    document.getElementById('formGuideDescription').textContent = exercise.description || '';

    const cues = exercise.form_cues || [];
    document.getElementById('formGuideCues').innerHTML = cues.map(c => `<li>${c}</li>`).join('');

    openModal('formGuideModal');
}

// Modal close buttons
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('formGuideClose');
    if (closeBtn) closeBtn.addEventListener('click', () => closeModal('formGuideModal'));
});
