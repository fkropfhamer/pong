const parseMessage = async (e) => {
    const t = await e.data.text()
    return JSON.parse(t)
}

export class WsClient {
    constructor() {
        this.ws = new WebSocket("ws://localhost:8080")
        this.ws.onopen = () => {
            console.log("open")
        }

        this.ws.onclose = () => {
            console.log("close")
        }

        this.ws.onerror = () => {
            console.log("error")
        }

        this.ws.onmessage = async (e) => {
            console.log("message", e);
            try {
                const message = await parseMessage(e);
                console.log(message)
            } catch (e) {
                console.log(e)
            }
        }
    }

    sendStart = () => this.send({message: "start"})

    send = (message) => {
        this.ws.send(JSON.stringify(message))
    }
}