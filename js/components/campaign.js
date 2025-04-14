export function initCampaign(state, audio) {
    const campaignPanel = document.getElementById('campaign');
    campaignPanel.innerHTML = `
        <div class="campaign-container">
            <h3>Missions</h3>
            <div class="mission-list" id="missions"></div>
        </div>
    `;

    const missions = [
        { id: 1, name: 'Outpost Assault', difficulty: 20, reward: 500 },
        { id: 2, name: 'Cyber Forge', difficulty: 40, reward: 1000 },
        { id: 3, name: 'Core Breach', difficulty: 70, reward: 2000 }
    ];

    const missionList = document.getElementById('missions');
    missions.forEach(m => {
        missionList.innerHTML += `
            <div class="mission-card">
                <h4>${m.name}</h4>
                <p>Difficulty: ${m.difficulty}</p>
                <p>Reward: ${m.reward} credits</p>
                <button class="button button-primary" data-id="${m.id}">Start</button>
            </div>
        `;
    });

    missionList.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const mission = missions.find(m => m.id == btn.dataset.id);
        audio.play('explosion');
        setTimeout(() => {
            state.updateState({
                credits: state.getState().credits + mission.reward,
                stats: { ...state.getState().stats, battles: state.getState().stats.battles + 1 }
            });
            document.getElementById('player-credits').textContent = `Credits: ${state.getState().credits}`;
            showNotification(`Mission completed! +${mission.reward} credits`);
        }, 1500);
    });

    function showNotification(message) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        gsap.fromTo(notification, { opacity: 0, x: 100 }, { opacity: 1, x: 0, duration: 0.5 });
        gsap.to(notification, { opacity: 0, x: 100, duration: 0.5, delay: 2 });
    }
}