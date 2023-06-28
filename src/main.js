import '../style.css'
import {WebGPURenderer} from "./render.js";
import {WsClient} from "./socket.js";
import {initWasm} from "../wasm/wasm.js";

(async function() {
    const startOnlineButton = document.getElementById("start-online");
    const startLocalButton = document.getElementById("start-local");
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

    startOnlineButton.onclick = () => {
        gameState.paddle1Y -= 0.1
        gameState.paddle2Y += 0.1

        renderer.render(gameState)

        client.sendStart()
    }

    const wasm = await initWasm()
    console.log(wasm.add(1, 2))

    const bufferSize = 4
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
        gameState.paddle1Y = wasmBuffer[2] / 500
        gameState.paddle2Y = wasmBuffer[3] / 500

        gameState.ballPosition = {x: wasmBuffer[0] / 5000, y: wasmBuffer[1] / 5000}
        renderer.render(gameState)

        requestAnimationFrame(gameLoop)
    }

    startLocalButton.onclick = () => {
        requestAnimationFrame(gameLoop)
    }

    document.addEventListener("keydown", event => {
        console.log("press", event.key)

        if (event.key === "ArrowDown") {
            wasm.updatePaddle2Y(-50)
        }

        if (event.key === "ArrowUp") {
            wasm.updatePaddle2Y(50)
        }

        if (event.key === "w" || event.key === "W") {
            wasm.updatePaddle1Y(50)
        }

        if (event.key === "s" || event.key === "S") {
            wasm.updatePaddle1Y(-50)
        }
    })
})()
