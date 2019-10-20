import Ball from './ball';

class Game
{
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;

        this.player1.side = false;
        this.player2.side = true;
        
        this.player1.game = this;
        this.player2.game = this;

        this.started = false;
    }

    start() {
        this.started = true;
        this.ball = new Ball(445, 295, this);
        this.ball.start();
        this.loop = setInterval((game) => game.update(), 10, this);
        this.player1.setup();
        this.player2.setup();
    }

    update() {
        this.ball.update();

        //this.player1.send("player1");
        //this.player2.send("player2");

        //this.player1.sendUpdate(this.player2.y);
        //this.player2.sendUpdate(this.player1.y);

        /*if (!this.loop) {
            this.loop = setInterval((game) => {
                game.loop = null;
                game.update();
            }, 20000, this);        
        }*/
        
    }

    playerDisconnected() {
        console.log(this.started);
        this.stop();
        console.log("a player disconnected")
    }

    stop() {
        this.started = false;
        clearInterval(this.loop);
    }

    playerUpdate(side, y) {
        if (side) {
            this.player1.sendOppUpdate(y);
        } else {
            this.player2.sendOppUpdate(y)
        }
    }

    sendBallUpdate(x, y) {
        this.player1.sendBallUpdate(x, y);
        this.player2.sendBallUpdate(x, y);
    }
}

export default Game;
