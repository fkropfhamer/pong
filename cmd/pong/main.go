package main

import (
	"fmt"
	"github.com/fkropfhamer/pong/pkg/wspong"
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

type wsMessage struct {
	Message string
	Payload interface{}
}

var (
	waitMu  sync.Mutex
	waiting *wspong.Client
)

func webSocketHandler(ws *websocket.Conn) {
	var isWaiting = false
	c := wspong.NewClient(ws)

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
				g := wspong.NewGame(c, waiting)

				go g.StartLoop()

				c.Game = g
				waiting.Game = g
				waiting = nil
			} else {
				waiting = c
				message := wspong.GameMessage{
					Message: "waiting",
				}
				waiting.SendMessage(message)
				isWaiting = true
			}
			waitMu.Unlock()
		}

		if message.Message == "updatePaddle" {
			deltaY := message.Payload.(float64)
			c.Game.UpdatePaddle(c, float32(deltaY))
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
