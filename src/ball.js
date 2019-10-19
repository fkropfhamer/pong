class Ball
{
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.yspeed = 0;
        this.xspeed = 0;
    }

    update() {
        console.log('ball updated');
    }
}

export default Ball;
