/**
 * ForgeFit - Achievements Page
 */

document.addEventListener('DOMContentLoaded', () => {
    loadAchievements();
});

async function loadAchievements() {
    try {
        const achievements = await API.get('/api/achievements');
        renderAchievements(achievements);
    } catch (e) {
        console.error('Failed to load achievements:', e);
    }
}

function renderAchievements(achievements) {
    const total = achievements.length;
    const unlocked = achievements.filter(a => a.unlocked).length;

    // Update ring
    document.getElementById('unlockedCount').textContent = unlocked;
    document.getElementById('totalCount').textContent = total;

    const circumference = 2 * Math.PI * 52; // r=52
    const pct = total > 0 ? unlocked / total : 0;
    const offset = circumference * (1 - pct);
    document.getElementById('achievementRing').style.strokeDashoffset = offset;

    // Update message
    const msgEl = document.getElementById('achievementMessage');
    if (unlocked === 0) {
        msgEl.textContent = 'Start working out to unlock your first achievement!';
    } else if (unlocked < total / 2) {
        msgEl.textContent = `You've unlocked ${unlocked} achievements. Keep pushing!`;
    } else if (unlocked < total) {
        msgEl.textContent = `Amazing progress! ${total - unlocked} more to go!`;
    } else {
        msgEl.textContent = 'You unlocked every achievement. Incredible!';
    }

    // Render grid - unlocked first
    const sorted = [...achievements].sort((a, b) => {
        if (a.unlocked && !b.unlocked) return -1;
        if (!a.unlocked && b.unlocked) return 1;
        return 0;
    });

    const grid = document.getElementById('achievementGrid');
    grid.innerHTML = sorted.map((ach, idx) => `
        <div class="achievement-card ${ach.unlocked ? 'unlocked' : 'locked'} animate-slide-up" style="animation-delay:${idx * 0.05}s">
            <div class="achievement-icon-wrap">${ach.icon || '\uD83C\uDFC5'}</div>
            <div class="achievement-info">
                <h3>${ach.name}</h3>
                <p>${ach.description}</p>
                ${ach.unlocked && ach.unlocked_date ? `<div class="achievement-date">Unlocked ${formatDate(ach.unlocked_date)}</div>` : ''}
            </div>
        </div>
    `).join('');
}
