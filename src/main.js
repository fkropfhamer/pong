import '../style.css'
import {WebGPURenderer} from "./render.js";
import {WsClient} from "./socket.js";
import {initWasm} from "../wasm/wasm.js";

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

    const wsUrl = "ws://localhost:8082/wspong"
    const client = new WsClient(wsUrl, onUpdate)

    startButton.onclick = () => {
        gameState.paddle1Y -= 0.1
        gameState.paddle2Y += 0.1

        renderer.render(gameState)

        client.sendStart()
    }

    const wasm = await initWasm()
    wasm.helloWasm("max")
    console.log(wasm.add(1, 2))

    const bufferSize = 2
    const bufferPointer = wasm.getBufferPointer()
    const wasmBuffer = new Float32Array(wasm.memory.buffer, bufferPointer, bufferSize)


    wasm.createGame()
    let lastTimeStamp = 0

    const gameLoop = (timeStamp) => {
        const timeDelta = timeStamp - lastTimeStamp
        const secondsPassed = timeDelta / 1000
        lastTimeStamp = timeStamp

        const fps = Math.round(1 / secondsPassed)
        console.log(`fps: ${fps}`)
        console.log(timeDelta)

        wasm.updateGame(timeDelta)

        gameState.ballPosition = {x: wasmBuffer[0] / 5000, y: wasmBuffer[1] / 5000}
        renderer.render(gameState)

        requestAnimationFrame(gameLoop)
    }

    startButton.onclick = () => {
        requestAnimationFrame(gameLoop)
    }
})()
