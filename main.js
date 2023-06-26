import './style.css'
import {WebGPURenderer} from "./render.js";
import {WsClient} from "./socket.js";

(async function init() {
    const startButton = document.getElementById("start");
    const canvas = document.getElementById("canvas")

    const renderer = new WebGPURenderer()
    if (!renderer.isSupported()) {
        console.log("web gpu not supported")
    }

    await renderer.init(canvas)

    const gameState = {
        paddle1Y: 0,
        paddle2Y: 0,
        ballPosition: { x: 0, y: 0 }
    }

    renderer.render(gameState)

    const client = new WsClient()

    startButton.onclick = () => {
        gameState.paddle1Y -= 0.1
        gameState.paddle2Y += 0.1

        renderer.render(gameState)

        client.sendStart()
    }
})()
