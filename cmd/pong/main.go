package main

import (
	"fmt"
	"golang.org/x/net/websocket"
	"log"
	"net/http"
)

func echo(ws *websocket.Conn) {
	for {
		var message string
		if err := websocket.Message.Receive(ws, &message); err != nil {
			fmt.Println("can not receive")
			break
		}

		fmt.Println("Received " + message)

		if err := websocket.Message.Send(ws, message); err != nil {
			fmt.Println("can not send")
			break
		}
	}
}

func main() {
	fmt.Println("Hello World!")

	http.Handle("/", websocket.Handler(echo))
	log.Fatal(http.ListenAndServe(":8080", nil))
}
