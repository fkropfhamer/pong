class Opponent
{
    constructor(side) {
        if(side) {
            this.x = 50;
        } else {
            this.x = 825;
        }

        this.y = 200;
        this.color= 'red';
    }

    update(y) {
        console.log(y)
        this.y = y;
    }

    draw(canvas) {
        canvas.drawRect(this.x, this.y, 25, 150, this.color);
    }
}

export default Opponent;
