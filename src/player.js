
class Player 
{
    constructor(socket, server) {
        this.socket = socket;
        this.y = 200;
        this.game = null;
        this.server = server;
        this.id = socket.id;
        console.log(socket.id)

        this.setupSocket();
    }

    setupSocket() {
        this.socket.on('disconnect', () => {
            if(this.game) {
                this.game.playerDisconnected();
            } else {
                this.server.playerDisconnected();
            }
        })
        this.socket.on('move', position => {
            console.log(position);
            this.update(position);
        })
    }

    send(msg) {
        
        this.socket.emit('test', msg);
    } 

    update(y) {
        this.y = y;
        this.game.playerUpdate(this.side, y);
    }

    setup() {
        this.socket.emit('setup', {y: this.y, side: this.side})
    }

    sendUpdate(oppx) {
        this.socket.emit('update', {opp: oppx})
    }
}

export default Player;
