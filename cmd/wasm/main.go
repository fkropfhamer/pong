package main

import (
	"fmt"
)

type data struct {
	a int
	b int
}

//export createData
func createData() *data {
	return &data{1, 2}
}

//export reduceData
func reduceData(x data) int {
	return x.b + x.a
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
