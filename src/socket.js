import server from './server';
import io from 'socket.io';
import Player from './player';
import Game from './game';

class Socket {
    constructor() {
        this.io = null;
        this.waitingPlayer = null;   
    }

    listen(port) {
        this.server = server.listen(port);
        this.io = io(this.server);
        this.setup();
    }

    setup() {
        this.io.on('connection', socket => {
            console.log('user connected');
            socket.emit('connected');
            const player = new Player(socket, this)
            if(!this.waitingPlayer) {
                console.log('player is waiting');
                this.waitingPlayer = player;
            } else {
                console.log('game is starting');
                let game = new Game(player, this.waitingPlayer);
                this.waitingPlayer = null;
                game.start();
                
            }
            
        });
    }

    playerDisconnected() {
        console.log('waiting Player disconnected');
        this.waitingPlayer = null;

    }
}

export default Socket;

