import './style.css'
import rectangleShader from './rectangle.wgsl?raw'

console.log("Hello World")

const ws = new WebSocket("ws://localhost:8080")
const startButton = document.getElementById("start");

(async function init() {
    if (!navigator.gpu) {
        throw Error("WebGPU not supported.");
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        throw Error("Couldn't request WebGPU adapter.");
    }

    const device = await adapter.requestDevice();

    const canvas = document.getElementById("canvas")
    const context = canvas.getContext("webgpu")

    const canvasFormat = navigator.gpu.getPreferredCanvasFormat()

    context.configure({
        device: device,
        format: canvasFormat,
        alphaMode: "premultiplied"
    })

    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
        colorAttachments: [{
            view: context.getCurrentTexture().createView(),
            loadOp: "clear",
            storeOp: "store",
            clearValue: { r: 1, g: 0, b: 0, a: 1 },
        }]
    });

    const vertices = new Float32Array([
        // X,    Y,   R,   G,   B,
        -0.8, -0.8, 0.0, 1.0, 0.0,
         0.8, -0.8, 0.0, 1.0, 0.0,
         0.8,  0.8, 0.0, 1.0, 0.0,
    ]);

    const vertexBuffer = device.createBuffer({
        label: "Cell vertices",
        size: vertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(vertexBuffer, /*bufferOffset=*/0, vertices);

    const vertexBufferLayout = {
        arrayStride: 5 * 4,
        attributes: [
            {
                format: "float32x2",
                offset: 0,
                shaderLocation: 0, // Position, see vertex shader
            }, {
                format: "float32x3",
                offset: 8,
                shaderLocation: 1,
            }],
    };

    const cellShaderModule = device.createShaderModule({
        label: 'Cell shader',
        code: rectangleShader
    });

    const cellPipeline = device.createRenderPipeline({
        label: "rectangle",
        layout: "auto",
        vertex: {
            module: cellShaderModule,
            entryPoint: "vertexMain",
            buffers: [vertexBufferLayout]
        },
        fragment: {
            module: cellShaderModule,
            entryPoint: "fragmentMain",
            targets: [{
                format: canvasFormat
            }]
        }
    });

    pass.setPipeline(cellPipeline);
    pass.setVertexBuffer(0, vertexBuffer);
    pass.draw(3);

    pass.end()
    device.queue.submit([encoder.finish()]);
    console.log('finished')


    startButton.onclick = () => {
        const encoder = device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
            colorAttachments: [{
                view: context.getCurrentTexture().createView(),
                loadOp: "clear",
                storeOp: "store",
                clearValue: { r: 1, g: 0, b: 0, a: 1 },
            }]
        });

        const vertices = new Float32Array([
            // X,    Y,   R,   G,   B,
            -0.8, -0.8, 0.0, 0.0, 1.0,
            -0.8, 0.8, 0.0, 0.0, 1.0,
            0.8,  0.8, 0.0, 0.0, 1.0,
        ]);

        const vertexBuffer = device.createBuffer({
            label: "Cell vertices",
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });

        device.queue.writeBuffer(vertexBuffer, /*bufferOffset=*/0, vertices);

        pass.setPipeline(cellPipeline);
        pass.setVertexBuffer(0, vertexBuffer);
        pass.draw(3);

        pass.end()
        device.queue.submit([encoder.finish()]);
    }
})()

ws.onopen = () => {
    console.log("open")
    ws.send(JSON.stringify({message: "message", payload: "payload"}))
}

ws.onclose = () => {
    console.log("close")
}

ws.onerror = () => {
    console.log("error")
}

ws.onmessage = (e) => {
    console.log("message", e)
}

startButton.onclick = () => {
    ws.send(JSON.stringify({ message: "start" }))
}
