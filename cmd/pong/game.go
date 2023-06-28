package main

import (
	"fmt"
	"time"
)

type Game struct {
	Client1       *client
	Client2       *client
	FieldState    FieldState
	stopChan      chan bool
	ballDirection [2]float32
}

type FieldState struct {
	BallPos  [2]float32
	Score1   int
	Score2   int
	Paddle1Y float32
	Paddle2Y float32
}

func NewGame(c1 *client, c2 *client) *Game {
	state := FieldState{
		BallPos:  [2]float32{0, 0},
		Paddle1Y: 0,
		Paddle2Y: 0,
		Score1:   0,
		Score2:   0,
	}

	g := Game{
		Client1:       c1,
		Client2:       c2,
		FieldState:    state,
		stopChan:      make(chan bool),
		ballDirection: [2]float32{0, 0},
	}

	return &g
}

func (g *Game) Update(timeDelta int) {
	g.FieldState.BallPos[0] = g.FieldState.BallPos[0] + 1
	fmt.Println(g.FieldState)
}

func (g *Game) StopLoop() {
	g.stopChan <- true
	fmt.Println("stop Game")
}

func (g *Game) StartLoop() {
	message := gameMessage{
		Message: "start",
	}

	g.Client1.SendMessage(message)
	g.Client2.SendMessage(message)

	ticker := time.NewTicker(10 * time.Millisecond)
	go func() {
		for {
			select {
			case <-ticker.C:
				g.Update(0)
				updateMessage := gameMessage{
					Message: "update",
					Payload: g.FieldState,
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
