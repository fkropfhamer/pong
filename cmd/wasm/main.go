package main

import (
	"fmt"
	"github.com/fkropfhamer/pong/pkg/pong"
)

const BufferSize = 4

var buffer [BufferSize]float32

var g *pong.Game

//export getBufferPointer
func getBufferPointer() *[BufferSize]float32 {
	return &buffer
}

//export createGame
func createGame() {
	g = pong.NewGame()
}

//export updateGame
func updateGame(timeDelta int) {
	g.Update(timeDelta)

	ballState := g.FieldState.BallPos

	buffer[0] = ballState[0]
	buffer[1] = ballState[1]
	buffer[2] = g.FieldState.Paddle1Y
	buffer[3] = g.FieldState.Paddle2Y
}

//export updatePaddle1Y
func updatePaddle1Y(delta float32) {
	g.FieldState.Paddle1Y += delta
}

//export updatePaddle2Y
func updatePaddle2Y(delta float32) {
	g.FieldState.Paddle2Y += delta
}

func main() {
	fmt.Println("Go Web Assembly")
}
