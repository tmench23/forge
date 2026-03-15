/**
 * ForgeFit - Core Application JavaScript
 * Shared utilities, navigation, and API helpers
 */

// ── API Helper ──
const API = {
    async get(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
        return res.json();
    },
    async post(url, data) {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`);
        return res.json();
    },
    async put(url, data) {
        const res = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`PUT ${url} failed: ${res.status}`);
        return res.json();
    },
};

// ── Toast Notifications ──
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = { success: '\u2705', error: '\u274C', info: '\u2139\uFE0F', pr: '\uD83C\uDFC6' };
    toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ── Mobile Navigation ──
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('navToggle');
    const links = document.querySelector('.nav-links');
    const overlay = document.getElementById('navOverlay');

    if (toggle) {
        toggle.addEventListener('click', () => {
            links.classList.toggle('open');
            overlay.classList.toggle('open');
        });

        overlay.addEventListener('click', () => {
            links.classList.remove('open');
            overlay.classList.remove('open');
        });

        // Close on nav link click (mobile)
        links.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                links.classList.remove('open');
                overlay.classList.remove('open');
            });
        });
    }
});

// ── Utility Functions ──
function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDuration(minutes) {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function getWorkoutTypeClass(type) {
    return `badge-${type}`;
}

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning!';
    if (hour < 17) return 'Good afternoon!';
    return 'Good evening!';
}

function getTodayISO() {
    return new Date().toISOString().split('T')[0];
}

// ── Modal Helpers ──
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

// Close modals on overlay click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay') && e.target.classList.contains('active')) {
        e.target.classList.remove('active');
    }
});

// Close modals on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
    }
});

// ── Exercise Form Guide Display ──
function showFormGuide(exercise) {
    const modal = document.getElementById('formGuideModal') || document.getElementById('exerciseModal');
    if (!modal) return;

    const nameEl = modal.querySelector('[id$="GuideName"], [id$="ExerciseName"]');
    const visualEl = modal.querySelector('[id$="GuideVisual"], [id$="Visual"]');
    const muscleEl = modal.querySelector('[id$="GuideMuscle"], [id$="Muscle"]');
    const equipEl = modal.querySelector('[id$="GuideEquipment"], [id$="Equipment"]');
    const diffEl = modal.querySelector('[id$="GuideDifficulty"], [id$="Difficulty"]');
    const descEl = modal.querySelector('[id$="GuideDescription"], [id$="Description"]');
    const cuesEl = modal.querySelector('[id$="GuideCues"], [id$="Cues"]');

    if (nameEl) nameEl.textContent = exercise.name;
    if (muscleEl) {
        muscleEl.textContent = exercise.muscle_group;
        muscleEl.className = 'form-guide-badge badge-' + exercise.category;
    }
    if (equipEl) {
        equipEl.textContent = exercise.equipment || 'Bodyweight';
        equipEl.className = 'form-guide-badge';
    }
    if (diffEl) {
        diffEl.textContent = exercise.difficulty;
        diffEl.className = 'form-guide-badge badge-' + exercise.difficulty;
    }
    if (descEl) descEl.textContent = exercise.description;

    // Visual - SVG animation
    if (visualEl) {
        ExerciseAnimations.render(visualEl, exercise.name);
    }

    // Form cues
    if (cuesEl) {
        const cues = exercise.form_cues || [];
        cuesEl.innerHTML = cues.map(cue => `<li>${cue}</li>`).join('');
    }

    modal.classList.add('active');
}
