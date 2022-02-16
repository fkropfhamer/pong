import './style.css'
import * as signalR from '@microsoft/signalr'



async function main() {
  const connection = new signalR.HubConnectionBuilder().withUrl("https://localhost:7007/game").build()

  connection.on("send", data => {
    console.log(data)
  })

  connection.on("message", data => {
    console.log(data)
  })

  const chatMessagesList = document.querySelector('#chat-messages')

  connection.on("ReceiveMessage", (username, message) => {
     const node = document.createElement('li')
     node.appendChild(document.createTextNode(`${username}: ${message}`))
     chatMessagesList.appendChild(node)
  })

  await connection.start()

  connection.invoke("Echo", "Hello")
  //connection.invoke("Connect")


  document.querySelector('#chat-button').onclick = () => {
    const message = document.querySelector('#chat-input').value

    if (!message) {
      return
    }

    connection.invoke("SendMessage", message)

    document.querySelector('#chat-input').value = ""
  }

  document.querySelector('#username-button').onclick = () => {
    const username = document.querySelector('#username-input').value

    if (!username) {
      return
    }

    connection.invoke("Join", username)

    document.querySelector('#username').hidden = true
    document.querySelector('#chat').hidden = false
  }

}

main()
