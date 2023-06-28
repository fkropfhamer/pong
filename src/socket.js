const parseMessage = async (e) => {
    const t = await e.data.text()
    return JSON.parse(t)
}

export class WsClient {
    open = false

    constructor(url, onUpdate) {
        this.ws = new WebSocket(url)
        this.ws.onopen = () => {
            console.log("open")
            this.open = true
        }

        this.ws.onclose = () => {
            console.log("close")
            this.open = false
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
    waitForConnection = async () => {
        const waitMS = 5000
        return new Promise(resolve => setTimeout(() => {
            if (this.open) {
                resolve()

                return
            }

            throw new Error("ws did not connect in time")
        }, waitMS));
    }

    updatePaddleY = (deltaY) => this.send({ message: "updatePaddle", payload: deltaY })

    sendStart = () => this.send({message: "start"})

    send = (message) => {
        this.ws.send(JSON.stringify(message))
    }
}