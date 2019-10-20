import Opponent from "./opponent";

class Player extends Opponent
{
    constructor(side, socket) {
        super(side);
        this.socket = socket;
        this.color = 'blue';
        this.setupKeyPressedEvents();
        this.moving = false;
        this.ySpeed = 0;
    }

    setupKeyPressedEvents() {
        window.addEventListener('keydown', e => this.keyPressed(e));
        window.addEventListener('keyup', e => this.keyUp(e));
    }

    keyPressed(e) {
        console.log('keydown', e);
        if (this.ySpeed === 0) {
            if (e.code === 'ArrowDown') {
                   //this.sendUpdate(this.y + 50);
                this.ySpeed = 10
               // this.update();
            } else if (e.code === 'ArrowUp') {
            //this.sendUpdate(this.y - 50);
                this.ySpeed = -10
                //this.update();
            }
        }
    }

    keyUp(e) {
        console.log('keyup', e);
        this.ySpeed = 0;
    }

    update() {
        console.log 
        const newY = this.y + this.ySpeed;
        if (this.y !== newY) {
            this.sendUpdate(newY);
        }
    }

    sendUpdate(y) {
        super.update(y);
        this.socket.emit('move', this.y);
    } 
}

export default Player;
