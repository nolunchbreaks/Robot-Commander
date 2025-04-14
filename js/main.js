import { initRobotBuilder } from './components/robotBuilder.js';
import { initBattleArena } from './components/battleArena.js';
import { initStatsPanel } from './components/statsPanel.js';
import { StateManager } from './utils/stateManager.js';
import { AudioManager } from './utils/audioManager.js';

// Initialize state manager
const state = new StateManager({
    activeTab: 'build',
    credits: 1000,
    level: 1,
    robot: {
        head: 'standard',
        body: 'standard',
        arms: 'standard',
        legs: 'standard',
        color: '#ff6a00'
    },
    stats: {
        battles: 0,
        victories: 0,
        damageDealt: 0
    }
});

// Initialize audio
const audio = new AudioManager({
    click: 'assets/sounds/click.mp3',
    battle: 'assets/sounds/battle.mp3'
});

// Tab navigation
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-pane');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabId = tab.dataset.tab;
        
        tabs.forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
        });
        panels.forEach(p => p.classList.add('hidden'));

        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        document.getElementById(`${tabId}-panel`).classList.remove('hidden');

        state.setState({ activeTab: tabId });
        audio.play('click');
    });
});

// Initialize components
document.addEventListener('DOMContentLoaded', () => {
    initRobotBuilder(state, audio);
    initBattleArena(state, audio);
    initStatsPanel(state);
    initCampaign(state, audio);

    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
    }, 1000);
});

// Campaign mode
function initCampaign(state, audio) {
    const missions = [
        { id: 1, name: 'First Contact', difficulty: 'Easy', reward: 500 },
        { id: 2, name: 'Desert Clash', difficulty: 'Medium', reward: 1000 },
        { id: 3, name: 'Final Stand', difficulty: 'Hard', reward: 2000 }
    ];

    const missionList = document.getElementById('mission-list');
    missions.forEach(mission => {
        const missionCard = document.createElement('div');
        missionCard.className = 'mission-card';
        missionCard.innerHTML = `
            <h3>${mission.name}</h3>
            <p>Difficulty: ${mission.difficulty}</p>
            <p>Reward: ${mission.reward} credits</p>
            <button class="button button-primary" data-mission="${mission.id}">Start Mission</button>
        `;
        missionList.appendChild(missionCard);
    });

    missionList.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const missionId = e.target.dataset.mission;
            audio.play('battle');
            showNotification(`Starting mission ${missionId}!`);
            // Simulate mission battle
            setTimeout(() => {
                const reward = missions.find(m => m.id == missionId).reward;
                state.updateState({
                    credits: state.getState().credits + reward,
                    stats: { ...state.getState().stats, battles: state.getState().stats.battles + 1 }
                });
                updateCredits();
                showNotification(`Mission completed! +${reward} credits`);
            }, 2000);
        }
    });
}

// Update UI
function updateCredits() {
    document.getElementById('credits').textContent = `Credits: ${state.getState().credits}`;
}

// Notifications
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 3000);
}