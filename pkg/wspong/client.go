package wspong

import (
	"encoding/json"
	"fmt"
	"golang.org/x/net/websocket"
)

type GameMessage struct {
	Message string
	Payload interface{}
}

type Client struct {
	Connection     *websocket.Conn
	Game           *Game
	IsDisconnected bool
}

func NewClient(con *websocket.Conn) *Client {
	c := Client{
		Connection:     con,
		Game:           nil,
		IsDisconnected: false,
	}

	return &c
}

func (c Client) SendMessage(message interface{}) {
	jsonMessage, err := json.Marshal(message)
	if err != nil {
		return
	}
	if err := websocket.Message.Send(c.Connection, jsonMessage); err != nil {
		fmt.Println("can not send")
		fmt.Println(err)
	}
}
