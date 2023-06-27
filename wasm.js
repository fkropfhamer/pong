import init from "./pong.wasm?init";

const go = new Go()
const instance = await init(go.importObject)

go.run(instance)

export const { add, helloWasm, reduceData, createData } = instance.exports