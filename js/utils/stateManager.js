export class StateManager {
    constructor(initialState) {
        this.state = initialState;
        this.subscribers = [];
    }

    getState() {
        return this.state;
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    }

    updateState(updates) {
        this.state = { ...this.state, ...updates };
        this.notify();
    }

    subscribe(callback) {
        this.subscribers.push(callback);
    }

    notify() {
        this.subscribers.forEach(cb => cb());
    }
}