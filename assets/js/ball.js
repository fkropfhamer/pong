class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = 'green';
        this.radius = 10;
    }

    update(x, y) {
        this.x = x;
        this.y = y;
    }

    draw(canvas) {
        canvas.drawCircle(this.x, this.y, this.radius, this.color);
    }
}

export default Ball;
