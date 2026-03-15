/**
 * ForgeFit - Schedule Page
 */

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
let scheduleData = [];
let templatesData = [];
let editingDay = null;

document.addEventListener('DOMContentLoaded', () => {
    initSchedule();
});

async function initSchedule() {
    await Promise.all([loadSchedule(), loadTemplatesForSuggestions()]);
    setupEditModal();
}

async function loadSchedule() {
    try {
        scheduleData = await API.get('/api/schedule');
        renderSchedule();
    } catch (e) {
        console.error('Failed to load schedule:', e);
    }
}

async function loadTemplatesForSuggestions() {
    try {
        templatesData = await API.get('/api/templates');
    } catch (e) {
        console.error('Failed to load templates:', e);
    }
}

function renderSchedule() {
    const grid = document.getElementById('scheduleGrid');
    const today = new Date().getDay();
    // Convert JS day (0=Sun) to our format (0=Mon)
    const todayIdx = today === 0 ? 6 : today - 1;

    grid.innerHTML = DAY_NAMES.map((name, idx) => {
        const daySchedule = scheduleData.find(s => s.day_of_week === idx);
        const type = daySchedule ? daySchedule.workout_type : 'rest';
        const isToday = idx === todayIdx;

        // Find matching template for "Start" link
        let templateId = null;
        if (daySchedule) {
            const match = templatesData.find(t => t.name === daySchedule.workout_name);
            if (match) templateId = match.id;
        }

        return `
            <div class="schedule-card type-${type} ${isToday ? 'today' : ''} animate-slide-up" style="animation-delay:${idx * 0.05}s">
                <div class="schedule-card-header">
                    <span class="schedule-day-name ${isToday ? 'today-label' : ''}">${name}${isToday ? ' (Today)' : ''}</span>
                    <span class="badge badge-${type}">${type}</span>
                </div>
                <h3>${daySchedule ? daySchedule.workout_name : 'Rest Day'}</h3>
                <p>${daySchedule ? (daySchedule.description || '') : 'Take it easy \u2013 light stretching recommended'}</p>
                <div class="schedule-card-actions">
                    <button class="btn btn-sm btn-outline" onclick="editDay(${idx})">Edit</button>
                    ${templateId && type !== 'rest' ? `<a href="/workout/${templateId}" class="btn btn-sm btn-primary">Start</a>` : ''}
                </div>
            </div>`;
    }).join('');
}

function editDay(dayIdx) {
    editingDay = dayIdx;
    const daySchedule = scheduleData.find(s => s.day_of_week === dayIdx);

    document.getElementById('editModalTitle').textContent = `Edit ${DAY_NAMES[dayIdx]}`;
    document.getElementById('editWorkoutType').value = daySchedule ? daySchedule.workout_type : 'rest';
    document.getElementById('editWorkoutName').value = daySchedule ? daySchedule.workout_name : '';
    document.getElementById('editDescription').value = daySchedule ? (daySchedule.description || '') : '';

    // Populate template suggestions
    const suggestions = document.getElementById('templateSuggestions');
    suggestions.innerHTML = templatesData.map(t => `
        <button class="template-suggestion" onclick="selectTemplate('${t.name}', '${t.workout_type}', '${(t.description || '').replace(/'/g, "\\'")}')">
            ${t.name}
        </button>
    `).join('');

    openModal('editModal');
}

function selectTemplate(name, type, desc) {
    document.getElementById('editWorkoutType').value = type;
    document.getElementById('editWorkoutName').value = name;
    document.getElementById('editDescription').value = desc;
}

function setupEditModal() {
    document.getElementById('editModalClose').addEventListener('click', () => closeModal('editModal'));
    document.getElementById('editModalCancel').addEventListener('click', () => closeModal('editModal'));
    document.getElementById('editModalSave').addEventListener('click', saveScheduleEdit);
}

async function saveScheduleEdit() {
    const type = document.getElementById('editWorkoutType').value;
    const name = document.getElementById('editWorkoutName').value || (type === 'rest' ? 'Rest Day' : 'Workout');
    const desc = document.getElementById('editDescription').value;

    // Update local data
    const existing = scheduleData.findIndex(s => s.day_of_week === editingDay);
    const entry = {
        day_of_week: editingDay,
        workout_type: type,
        workout_name: name,
        description: desc,
    };

    if (existing >= 0) {
        scheduleData[existing] = { ...scheduleData[existing], ...entry };
    } else {
        scheduleData.push(entry);
    }

    try {
        await API.post('/api/schedule', scheduleData);
        showToast('Schedule updated!', 'success');
        renderSchedule();
    } catch (e) {
        showToast('Failed to save schedule', 'error');
    }

    closeModal('editModal');
}
