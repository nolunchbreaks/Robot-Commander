export class CanvasRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawRobot(parts, color, x, y) {
        this.ctx.save();
        this.ctx.translate(x, y);

        // Legs
        this.ctx.fillStyle = color;
        this.ctx.fillRect(-40, -40, 30, 80);
        this.ctx.fillRect(10, -40, 30, 80);

        // Body
        this.ctx.fillRect(-50, -120, 100, 80);

        // Arms
        this.ctx.fillRect(-80, -110, 30, 60);
        this.ctx.fillRect(50, -110, 30, 60);

        // Head
        this.ctx.fillRect(-30, -180, 60, 60);

        // Eyes
        this.ctx.fillStyle = '#00ffff';
        this.ctx.beginPath();
        this.ctx.arc(-15, -150, 8, 0, Math.PI * 2);
        this.ctx.arc(15, -150, 8, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }
}