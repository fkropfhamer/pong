import Opponent from "./opponent";

class Player extends Opponent
{
    constructor(side, socket) {
        super(side);
        this.socket = socket;
        this.setupKeyPressedEvents();
    }

    setupKeyPressedEvents() {
        window.addEventListener('keydown', e => this.keyPressed(e))
    }

    keyPressed(e) {
        if (e.code === 'ArrowDown') {
            this.update(this.y + 20);
        } else if (e.code === 'ArrowUp') {
            this.update(this.y - 20);
        }
    }

    update(y) {
        super.update(y);
        this.socket.emit('move', this.y);
    } 
}

export default Player;
