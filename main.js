import './style.css'

console.log("Hello World")

const ws = new WebSocket("ws://localhost:8080")

ws.onopen = () => {
    console.log("open")
    ws.send("aa")
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
