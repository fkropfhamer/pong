import Game from './game';

/*
let canvas;
let socket;
let player;
let opponent;
let ball;

const setupSocket = socket => {
    socket.on('update', msg => {
        console.log(msg);
    })
}

const init = () => {
    socket = io();
    socket.on('connected', socket => {
        console.log('connected');
    })
    socket.on('update', msg => {
        console.log(msg);
    })
    

    canvas = new Canvas(900, 600);
    
    window.requestAnimationFrame(gameLoop);
}




let x = 0

const draw = () => {
    x++;
    
    canvas.reset();
    
    
}*/

let game;

const gameLoop = timeStamp => {
    game.draw();
    window.requestAnimationFrame(gameLoop);

}

const init = () => {
    game = new Game();
    game.setupSocket(gameLoop);
    /*game.setup();
    game.draw();

    //
*/



}

window.onload = init;

