package main

import (
	"encoding/json"
	"fmt"
	"golang.org/x/net/websocket"
	"log"
	"net/http"
	"sync"
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

type client struct {
	Connection     *websocket.Conn
	Game           *Game
	IsDisconnected bool
}

func (c client) SendMessage(message interface{}) {
	jsonMessage, err := json.Marshal(message)
	if err != nil {
		return
	}
	if err := websocket.Message.Send(c.Connection, jsonMessage); err != nil {
		fmt.Println("can not send")
		fmt.Println(err)
	}
}

type wsMessage struct {
	Message string
	Payload string
}

type gameMessage struct {
	Message string
	Payload interface{}
}

var (
	waitMu  sync.Mutex
	waiting *client
)

func webSocketHandler(ws *websocket.Conn) {
	var isWaiting = false
	var c = client{
		Connection:     ws,
		IsDisconnected: false,
	}

	for {
		var message wsMessage
		if err := websocket.JSON.Receive(ws, &message); err != nil {
			fmt.Println("can not receive")
			fmt.Println(err)

			c.IsDisconnected = true
			fmt.Println("disconnected")
			if c.Game != nil {
				c.Game.StopLoop()
			}

			waitMu.Lock()
			if isWaiting {
				waiting = nil
			}
			waitMu.Unlock()

			break
		}

		if message.Message == "start" {
			if isWaiting {
				continue
			}

			waitMu.Lock()

			if waiting != nil {
				g := NewGame(&c, waiting)

				go g.StartLoop()

				c.Game = g
				waiting.Game = g
				waiting = nil
			} else {
				waiting = &c
				message := gameMessage{
					Message: "waiting",
				}
				waiting.SendMessage(message)
				isWaiting = true
			}
			waitMu.Unlock()
		}

		fmt.Println(message.Message)
	}
}

func main() {
	fmt.Println("Hello World!")

	http.Handle("/echo", websocket.Handler(echo))
	http.Handle("/pong", websocket.Handler(webSocketHandler))
	log.Fatal(http.ListenAndServe(":8082", nil))
}
