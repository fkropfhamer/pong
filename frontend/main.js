import './style.css'
import * as signalR from '@microsoft/signalr'

document.querySelector('#app').innerHTML = `
  <h1>Hello Vite!</h1>
  <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
`


async function main() {
  const connection = new signalR.HubConnectionBuilder().withUrl("https://localhost:7007/game").build()

  connection.on("send", data => {
    console.log(data)
  })

  await connection.start()

  connection.invoke("Echo", "Hello")


  document.querySelector('#button').onclick = () => {
    connection.invoke("Echo", "Haha")
  }

}

main()
