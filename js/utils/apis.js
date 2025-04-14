export async function saveGame(state) {
    try {
        // Mock API call
        localStorage.setItem('gameState', JSON.stringify(state));
        return { success: true };
    } catch (error) {
        console.error('Save failed:', error);
        return { success: false };
    }
}

export async function fetchLeaderboard() {
    // Mock leaderboard
    return [
        { name: 'Player1', score: 1000 },
        { name: 'Player2', score: 800 }
    ];
}