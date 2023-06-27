# pong
            

## wasm
- runtime `cp $(tinygo env TINYGOROOT)/targets/wasm_exec.js ./wasm/`
- build `tinygo build -o ./wasm/pong.wasm -target wasm cmd/wasm/main.go`
