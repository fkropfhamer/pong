import './style.css'

console.log("Hello World")

const ws = new WebSocket("ws://localhost:8080")
const startButton = document.getElementById("start")

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
    console.log("message", e)
}

startButton.onclick = () => {
    ws.send(JSON.stringify({ message: "start" }))
}
