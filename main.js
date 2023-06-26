import './style.css'
import {WebGPURenderer} from "./render.js";

(async function init() {
    const ws = new WebSocket("ws://localhost:8080")
    const startButton = document.getElementById("start");
    const canvas = document.getElementById("canvas")

    ws.onopen = () => {
        console.log("open")
        ws.send(JSON.stringify({message: "message", payload: "payload"}))
    }

    ws.onclose = () => {
        console.log("close")
    }

    ws.onerror = () => {
        console.log("error")
    }

    ws.onmessage = (e) => {
        console.log("message", e);
        (async () => {
            const t = await e.data.text()
            const message = JSON.parse(t)
            console.log(message)
        })()
    }

    const renderer = new WebGPURenderer()
    if (!renderer.isSupported()) {
        console.log("web gpu not supported")
    }

    await renderer.init(canvas)

    const gameState = {
        paddle1Y: 0,
        paddle2Y: 0,
    }

    renderer.render(gameState)

    startButton.onclick = () => {
        gameState.paddle1Y -= 0.1
        gameState.paddle2Y += 0.1

        renderer.render(gameState)

        // ws.send(JSON.stringify({message: "start"}))
    }
})()
