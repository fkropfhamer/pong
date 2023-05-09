package main

import (
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

type wsMessage struct {
	Message string
	Payload string
}

var (
	waitMu  sync.Mutex
	waiting *websocket.Conn
)

func webSocketHandler(ws *websocket.Conn) {
	var isWaiting = false

	for {
		var message wsMessage
		if err := websocket.JSON.Receive(ws, &message); err != nil {
			fmt.Println("can not receive")
			fmt.Println(err)
			break
		}

		if message.Message == "start" {
			if isWaiting {
				continue
			}

			waitMu.Lock()

			if waiting != nil {
				go start(ws, waiting)
				waiting = nil
			} else {
				waiting = ws
				if err := websocket.Message.Send(ws, "waiting"); err != nil {
					fmt.Println("can not send")
					return
				}
				isWaiting = true
			}
			waitMu.Unlock()
		}

		fmt.Println(message.Message)
	}
}

func start(ws1 *websocket.Conn, ws2 *websocket.Conn) {
	message := "started"
	if err := websocket.Message.Send(ws1, message); err != nil {
		fmt.Println("can not send")
		return
	}

	if err := websocket.Message.Send(ws2, message); err != nil {
		fmt.Println("can not send")
		return
	}

	ticker := time.NewTicker(10 * time.Millisecond)
	quit := make(chan struct{})
	go func() {
		for {
			select {
			case <-ticker.C:
				if err := websocket.Message.Send(ws1, "update"); err != nil {
					fmt.Println("can not send")
					return
				}
				if err := websocket.Message.Send(ws2, "update"); err != nil {
					fmt.Println("can not send")
					return
				}
			case <-quit:
				ticker.Stop()
				return
			}
		}
	}()

}

func main() {
	fmt.Println("Hello World!")

	http.Handle("/echo", websocket.Handler(echo))
	http.Handle("/", websocket.Handler(webSocketHandler))
	log.Fatal(http.ListenAndServe(":8080", nil))
}
