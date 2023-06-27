const parseMessage = async (e) => {
    const t = await e.data.text()
    return JSON.parse(t)
}

export class WsClient {
    constructor(url, onUpdate) {
        this.ws = new WebSocket(url)
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
                if (message.Message === "update") {
                    onUpdate(message.Payload)
                }

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