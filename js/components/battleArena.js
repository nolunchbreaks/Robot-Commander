import { CanvasRenderer } from '../utils/canvasRenderer.js';
import gsap from '../../lib/gsap.min.js';

export function initBattleArena(state, audio) {
    const battlePanel = document.getElementById('battle');
    battlePanel.innerHTML = `
        <div class="battle-container">
            <div class="opponent-selection" id="opponents"></div>
            <div class="battle-arena">
                <div class="battle-header">
                    <div class="battle-robot">
                        <h3>Your Robot</h3>
                        <div class="health-bar"><div class="health-fill" id="player-health"></div></div>
                    </div>
                    <div><h3>VS</h3></div>
                    <div class="battle-robot">
                        <h3 id="opponent-name">Select Opponent</h3>
                        <div class="health-bar"><div class="health-fill" id="opponent-health"></div></div>
                    </div>
                </div>
                <canvas id="battle-canvas" width="800" height="400"></canvas>
                <div class="battle-log" id="battle-log"></div>
                <div class="battle-actions">
                    <button class="button button-primary" id="attack" disabled>Attack</button>
                    <button class="button button-secondary" id="ability" disabled>Ability</button>
                    <button class="button button-secondary" id="defend" disabled>Defend</button>
                </div>
            </div>
        </div>
    `;

    const opponents = [
        { id: 1, name: 'Rusty Bot', stats: { armor: 20, attack: 10, speed: 10 }, difficulty: 20 },
        { id: 2, name: 'Iron Crusher', stats: { armor: 30, attack: 20, speed: 15 }, difficulty: 40 },
        { id: 3, name: 'Quantum Drone', stats: { armor: 50, attack: 30, speed: 20 }, difficulty: 70 }
    ];

    const renderer = new CanvasRenderer('battle-canvas');
    let battleState = {
        playerHealth: 100,
        opponent: null,
        opponentHealth: 100,
        turn: 'player',
        abilitiesUsed: []
    };

    renderOpponents();
    updateUI();

    function renderOpponents() {
        const selection = document.getElementById('opponents');
        opponents.forEach(o => {
            const card = document.createElement('div');
            card.className = 'opponent-card';
            card.dataset.id = o.id;
            card.innerHTML = `
                <h3>${o.name}</h3>
                <p>Difficulty: ${o.difficulty}</p>
            `;
            selection.appendChild(card);
        });

        selection.addEventListener('click', (e) => {
            const card = e.target.closest('.opponent-card');
            if (!card) return;
            battleState.opponent = opponents.find(o => o.id == card.dataset.id);
            battleState.playerHealth = 100;
            battleState.opponentHealth = 100;
            battleState.turn = 'player';
            battleState.abilitiesUsed = [];
            updateUI();
            audio.play('click');
        });
    }

    function updateUI() {
        document.getElementById('opponent-name').textContent = battleState.opponent?.name || 'Select Opponent';
        document.getElementById('player-health').style.width = `${battleState.playerHealth}%`;
        document.getElementById('opponent-health').style.width = `${battleState.opponentHealth}%`;

        const buttons = ['attack', 'ability', 'defend'].map(id => document.getElementById(id));
        buttons.forEach(btn => btn.disabled = !battleState.opponent || battleState.turn !== 'player');

        renderer.clear();
        renderer.drawRobot(state.getState().robot, state.getState().robot.color, 200, 300);
        if (battleState.opponent) {
            renderer.drawRobot({ head: 'standard', body: 'standard', arms: 'standard', legs: 'standard' }, '#cc5500', 600, 300);
        }
    }

    document.getElementById('attack').addEventListener('click', () => {
        performAction('attack', 1);
        audio.play('laser');
    });

    document.getElementById('ability').addEventListener('click', () => {
        performAction('ability', 1.5);
        audio.play('explosion');
    });

    document.getElementById('defend').addEventListener('click', () => {
        performAction('defend', 0.5);
        audio.play('click');
    });

    function performAction(type, multiplier) {
        if (battleState.turn !== 'player') return;

        let damage = 0;
        if (type === 'attack' || type === 'ability') {
            damage = Math.floor(Math.random() * 20 + 10) * multiplier;
            battleState.opponentHealth = Math.max(0, battleState.opponentHealth - damage);
            log(`Player ${type === 'ability' ? 'uses ability' : 'attacks'} for ${damage} damage!`);
            gsap.to('#battle-canvas', { x: 10, duration: 0.1, repeat: 1, yoyo: true });
        } else {
            log('Player defends, reducing next damage!');
        }

        if (battleState.opponentHealth <= 0) {
            endBattle(true);
            return;
        }

        battleState.turn = 'opponent';
        updateUI();

        setTimeout(() => {
            opponentTurn(type === 'defend' ? 0.5 : 1);
        }, 1000);
    }

    function opponentTurn(defenseMultiplier) {
        const damage = Math.floor(Math.random() * 20 + 10) * defenseMultiplier;
        battleState.playerHealth = Math.max(0, battleState.playerHealth - damage);
        log(`Opponent attacks for ${damage} damage!`);
        gsap.to('#battle-canvas', { x: -10, duration: 0.1, repeat: 1, yoyo: true });

        if (battleState.playerHealth <= 0) {
            endBattle(false);
            return;
        }

        battleState.turn = 'player';
        updateUI();
    }

    function endBattle(won) {
        const reward = won ? battleState.opponent.difficulty * 10 : 0;
        const xp = won ? 50 : 20;
        state.updateState({
            credits: state.getState().credits + reward,
            stats: {
                ...state.getState().stats,
                battles: state.getState().stats.battles + 1,
                victories: won ? state.getState().stats.victories + 1 : state.getState().stats.victories,
                xp: state.getState().stats.xp + xp
            },
            level: Math.floor(state.getState().stats.xp / 100) + 1
        });
        log(won ? `Victory! +${reward} credits, +${xp} XP` : `Defeat... +${xp} XP`);
        document.getElementById('player-credits').textContent = `Credits: ${state.getState().credits}`;
        document.getElementById('player-level').textContent = `Level: ${state.getState().level}`;
        updateUI();
    }

    function log(message) {
        const log = document.getElementById('battle-log');
        log.innerHTML += `<div>${message}</div>`;
        log.scrollTop = log.scrollHeight;
    }
}