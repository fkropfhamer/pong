class Ball
{
    constructor(x, y, game) {
        this.x = x;
        this.y = y;
        this.game = game;
        this.yspeed = 0;
        this.xspeed = 0;
    }

    update() {
        console.log('ball updated', this.xspeed, this.x);
        if (this.x === 815 || this.x === 85) {
            this.xspeed = -this.xspeed;
        }
        if (this.y === 20 || this.y === 580) {
            this.yspeed = -this.yspeed;
        }
        this.x += this.xspeed;
        this.y += this.yspeed;

        this.game.sendBallUpdate(this.x, this.y);
    }

    start() {
        const randomDirection = Math.round(Math.random());
        this.xspeed = randomDirection === 0 ? -1 : 1;
        this.yspeed = 1;
    }
}

export default Ball;
