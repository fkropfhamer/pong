import init from "./pong.wasm?init";
import "./wasm_exec.js"

export const initWasm = async () => {
    const go = new Go()
    const instance = await init(go.importObject)

    go.run(instance)

    return instance.exports
}
