export class AudioManager {
    constructor(sounds) {
        this.sounds = {};
        Object.keys(sounds).forEach(key => {
            this.sounds[key] = new Audio(sounds[key]);
        });
    }

    play(key) {
        if (this.sounds[key]) {
            this.sounds[key].currentTime = 0;
            this.sounds[key].play().catch(() => {});
        }
    }
}