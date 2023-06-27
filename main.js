import './style.css'
import {WebGPURenderer} from "./render.js";
import {WsClient} from "./socket.js";
import * as wasm from "./wasm.js";

(async function() {
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

    const onUpdate = (payload) => {
        console.log(payload)

        gameState.ballPosition.x = payload.BallPos[0] / 5000
        gameState.ballPosition.y = payload.BallPos[1] / 5000

        requestAnimationFrame(() => renderer.render(gameState))
    }

    const wsUrl = "ws://localhost:8082/pong"
    const client = new WsClient(wsUrl, onUpdate)

    startButton.onclick = () => {
        gameState.paddle1Y -= 0.1
        gameState.paddle2Y += 0.1

        renderer.render(gameState)

        client.sendStart()
    }

    wasm.helloWasm("max")
    console.log(wasm.add(1, 2))
    console.log(wasm.reduceData({a: 1, b: 4}))
    console.log(wasm.createData());
})()
