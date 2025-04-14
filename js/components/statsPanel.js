export function initStatsPanel(state) {
    const statsPanel = document.getElementById('stats-panel');
    statsPanel.innerHTML = `
        <div class="stats-container">
            <div class="stats-card">
                <h3>Battle Statistics</h3>
                <div class="stat-item"><span>Total Battles</span><span id="total-battles"></span></div>
                <div class="stat-item"><span>Victories</span><span id="victories"></span></div>
                <div class="stat-item"><span>Win Rate</span><span id="win-rate"></span></div>
            </div>
            <div class="stats-card">
                <h3>Robot Performance</h3>
                <div class="stat-item"><span>Damage Dealt</span><span id="damage-dealt"></span></div>
                <div class="stat-item"><span>Critical Hits</span><span>0</span></div>
                <div class="stat-item"><span>Successful Dodges</span><span>0</span></div>
            </div>
        </div>
    `;

    updateStats();

    state.subscribe(() => updateStats());

    function updateStats() {
        const stats = state.getState().stats;
        document.getElementById('total-battles').textContent = stats.battles;
        document.getElementById('victories').textContent = stats.victories;
        document.getElementById('win-rate').textContent = stats.battles > 0 ? `${Math.round((stats.victories / stats.battles) * 100)}%` : '0%';
        document.getElementById('damage-dealt').textContent = stats.damageDealt || 0;
    }
}