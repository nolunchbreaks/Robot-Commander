import { CanvasRenderer } from '../utils/canvasRenderer.js';
import gsap from '../../lib/gsap.min.js';

export function initRobotBuilder(state, audio) {
    const buildPanel = document.getElementById('build');
    buildPanel.innerHTML = `
        <div class="build-container">
            <div class="parts-selection">
                <h3>Parts Inventory</h3>
                <div class="parts-grid" id="parts-grid"></div>
            </div>
            <div class="robot-preview">
                <canvas id="robot-canvas" width="400" height="400"></canvas>
                <div class="robot-stats" id="robot-stats"></div>
                <div class="customization">
                    <label for="robot-color">Color:</label>
                    <input type="color" id="robot-color" value="#ff6a00">
                </div>
                <div class="action-buttons">
                    <button class="button button-secondary" id="reset-robot">Reset</button>
                    <button class="button button-primary" id="save-robot">Save</button>
                </div>
            </div>
        </div>
    `;

    const parts = {
        head: [
            { type: 'standard', armor: 10, energy: 5, ability: 'Scan', cost: 0 },
            { type: 'advanced', armor: 15, energy: 10, ability: 'Overclock', cost: 500 }
        ],
        body: [
            { type: 'standard', armor: 20, energy: 15, ability: 'Shield', cost: 0 },
            { type: 'reinforced', armor: 30, energy: 10, ability: 'Regenerate', cost: 800 }
        ],
        arms: [
            { type: 'standard', attack: 15, speed: 10, ability: 'Power Strike', cost: 0 },
            { type: 'power', attack: 25, speed: 5, ability: 'Laser Barrage', cost: 600 }
        ],
        legs: [
            { type: 'standard', speed: 15, dodge: 10, ability: 'Dash', cost: 0 },
            { type: 'agile', speed: 20, dodge: 15, ability: 'Evade', cost: 700 }
        ]
    };

    const renderer = new CanvasRenderer('robot-canvas');
    renderParts();
    updateStats();
    renderRobot();

    function renderParts() {
        const grid = document.getElementById('parts-grid');
        Object.entries(parts).forEach(([part, items]) => {
            items.forEach(item => {
                const div = document.createElement('div');
                div.className = `part-item ${state.getState().robot[part].type === item.type ? 'selected' : ''}`;
                div.dataset.part = part;
                div.dataset.type = item.type;
                div.innerHTML = `
                    <h4>${item.type.charAt(0).toUpperCase() + item.type.slice(1)} ${part.charAt(0).toUpperCase() + part.slice(1)}</h4>
                    <p>Ability: ${item.ability}</p>
                    ${Object.entries(item).map(([key, value]) => key !== 'type' && key !== 'ability' && key !== 'cost' ? `<p>${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}</p>` : '').join('')}
                    <p>Cost: ${item.cost}</p>
                `;
                grid.appendChild(div);
                gsap.from(div, { opacity: 0, y: 20, duration: 0.5, delay: grid.children.length * 0.1 });
            });
        });

        grid.addEventListener('click', (e) => {
            const item = e.target.closest('.part-item');
            if (!item) return;

            const part = item.dataset.part;
            const type = item.dataset.type;
            const cost = parts[part].find(p => p.type === type).cost;

            if (state.getState().credits >= cost) {
                state.updateState({
                    robot: { ...state.getState().robot, [part]: { type, level: 1 } },
                    credits: state.getState().credits - cost
                });
                document.querySelectorAll(`.part-item[data-part="${part}"]`).forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                updateStats();
                renderRobot();
                audio.play('click');
                document.getElementById('player-credits').textContent = `Credits: ${state.getState().credits}`;
                showNotification(`Equipped ${type} ${part}!`);
            } else {
                showNotification('Not enough credits!');
            }
        });
    }

    function updateStats() {
        const stats = { armor: 0, energy: 0, attack: 0, speed: 0, dodge: 0 };
        Object.entries(state.getState().robot).forEach(([part, { type }]) => {
            if (part === 'color') return;
            const item = parts[part].find(p => p.type === type);
            Object.entries(item).forEach(([key, value]) => {
                if (stats[key]) stats[key] += value;
            });
        });

        document.getElementById('robot-stats').innerHTML = `
            <h3>Robot Stats</h3>
            ${Object.entries(stats).map(([stat, value]) => `
                <div class="stat-bar">
                    <div class="stat-bar-label">${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${value}</div>
                    <div class="stat-bar-fill" style="width: ${Math.min(value, 100)}%"></div>
                </div>
            `).join('')}
        `;
    }

    function renderRobot() {
        renderer.clear();
        renderer.drawRobot(state.getState().robot, state.getState().robot.color);
    }

    document.getElementById('robot-color').addEventListener('change', (e) => {
        state.updateState({ robot: { ...state.getState().robot, color: e.target.value } });
        renderRobot();
        audio.play('click');
    });

    document.getElementById('reset-robot').addEventListener('click', () => {
        state.updateState({
            robot: {
                head: { type: 'standard', level: 1 },
                body: { type: 'standard', level: 1 },
                arms: { type: 'standard', level: 1 },
                legs: { type: 'standard', level: 1 },
                color: '#ff6a00'
            }
        });
        renderParts();
        updateStats();
        renderRobot();
        audio.play('click');
        showNotification('Robot reset!');
    });

    document.getElementById('save-robot').addEventListener('click', () => {
        const inventory = state.getState().inventory;
        inventory.push({ ...state.getState().robot, id: Date.now() });
        state.updateState({ inventory });
        localStorage.setItem('gameState', JSON.stringify(state.getState()));
        showNotification('Robot saved to inventory!');
        audio.play('click');
    });

    function showNotification(message) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        gsap.fromTo(notification, { opacity: 0, x: 100 }, { opacity: 1, x: 0, duration: 0.5 });
        gsap.to(notification, { opacity: 0, x: 100, duration: 0.5, delay: 2 });
    }
}