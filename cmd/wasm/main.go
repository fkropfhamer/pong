package main

import (
	"fmt"
	"github.com/fkropfhamer/pong/pkg/pong"
)

const BufferSize = 2

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
}

//export helloWasm
func helloWasm(name string) {
	fmt.Print(fmt.Sprintf("Hello %s from wasm!\n", name))
}

//export add
func add(x int, y int) int {
	return x + y
}

func main() {
	fmt.Println("Go Web Assembly")
}
