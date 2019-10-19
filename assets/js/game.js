import Canvas from './canvas';
import Ball from './ball';
import Player from './player';
import Opponent from './opponent';


class Game
{
    constructor() {
        this.canvas = new Canvas(900, 600);

        this.socket = null;
        this.player = null;
        this.opponent = null;
        this.ball = null;

        //this.socket = socket;

       this.x = 0;

        this.started = false;
    }

    setupSocket(g) {
        const socket = io();
        
        socket.on('connected', socket => {
            console.log('connected');
        })
        socket.on('update', msg => {
            console.log(msg);
            this.opponent.update(msg.opp);
        })
        socket.on('test', msg => {
            console.log(msg);
        })
        socket.on('setup', data => {
            console.log(data);
            this.side = data.side;
            this.setup();
            window.requestAnimationFrame(g);
        }) 

        this.socket = socket;
    }

    setup() {
        this.ball = new Ball(400, 100);
        this.player = new Player(this.side, this.socket);
        this.opponent = new Opponent(!this.side);
    }

    /*gameLoop() {
        this.draw();
        window.requestAnimationFrame(this.gameLoop())
    }*/

    draw() {
        this.x++;
        this.x %= 800;
        this.canvas.reset();
        this.canvas.drawRect(this.x, this.x, 200, 200, '#FF0000');
        this.player.draw(this.canvas);
        this.opponent.draw(this.canvas);
        this.ball.draw(this.canvas);
        
    }
}

export default Game;
