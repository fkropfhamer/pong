# pong
            

## wasm
- runtime `cp $(tinygo env TINYGOROOT)/targets/wasm_exec.js .`
- build `tinygo build -o pong.wasm -target wasm cmd/wasm/main.go`