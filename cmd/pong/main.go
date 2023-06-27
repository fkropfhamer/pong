package main

import (
	"encoding/json"
	"fmt"
	"golang.org/x/net/websocket"
	"log"
	"net/http"
	"sync"
	"time"
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
	Game           *game
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

type game struct {
	Client1  *client
	Client2  *client
	state    gameState
	stopChan chan bool
}

type gameState struct {
	BallPos  [2]float32
	Paddle1Y float32
	Paddle2Y float32
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
				c.Game.Stop()
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
				var g = game{
					Client1: &c,
					Client2: waiting,
				}

				go g.Start()

				c.Game = &g
				waiting.Game = &g
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

func (g *game) Update() {
	g.state.BallPos[0] = g.state.BallPos[0] + 1
	fmt.Println(g.state)
}

func (g *game) Stop() {
	g.stopChan <- true
	fmt.Println("stop game")
}

func (g *game) Start() {
	message := gameMessage{
		Message: "start",
	}
	state := gameState{
		BallPos:  [2]float32{0, 0},
		Paddle1Y: 0,
		Paddle2Y: 0,
	}

	g.state = state

	g.Client1.SendMessage(message)
	g.Client2.SendMessage(message)

	ticker := time.NewTicker(10 * time.Millisecond)
	g.stopChan = make(chan bool)
	go func() {
		for {
			select {
			case <-ticker.C:
				g.Update()
				updateMessage := gameMessage{
					Message: "update",
					Payload: g.state,
				}

				g.Client1.SendMessage(updateMessage)
				g.Client2.SendMessage(updateMessage)

			case <-g.stopChan:
				ticker.Stop()
				return
			}
		}
	}()

}

func main() {
	fmt.Println("Hello World!")

	http.Handle("/echo", websocket.Handler(echo))
	http.Handle("/pong", websocket.Handler(webSocketHandler))
	log.Fatal(http.ListenAndServe(":8082", nil))
}
