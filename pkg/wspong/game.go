package wspong

import (
	"fmt"
	"github.com/fkropfhamer/pong/pkg/pong"
	"time"
)

type WsGame struct {
	Client1  *Client
	Client2  *Client
	Game     *pong.Game
	stopChan chan bool
}

func NewGame(c1 *Client, c2 *Client) *WsGame {
	g := WsGame{
		Client1:  c1,
		Client2:  c2,
		Game:     pong.NewGame(),
		stopChan: make(chan bool),
	}

	return &g
}

func (g *WsGame) StopLoop() {
	g.stopChan <- true
	fmt.Println("stop Game")
}

func (g *WsGame) StartLoop() {
	message := GameMessage{
		Message: "start",
	}

	g.Client1.SendMessage(message)
	g.Client2.SendMessage(message)

	ticker := time.NewTicker(10 * time.Millisecond)
	var lastTimeStamp int64 = 0
	go func() {
		for {
			select {
			case timeStamp := <-ticker.C:
				timeDelta := timeStamp.UnixMilli() - lastTimeStamp
				lastTimeStamp = timeStamp.UnixMilli()

				g.Game.Update(timeDelta)
				updateMessage := GameMessage{
					Message: "update",
					Payload: g.Game.FieldState,
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
