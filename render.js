import middleLineShader from './middleLine.wgsl?raw'
import paddleShader from './paddle.wgsl?raw'
import ballShader from './ball.wgsl?raw'

export class WebGPURenderer {
    isSupported = () => {
        return !!navigator.gpu
    }

    init = async (canvas) => {
        const gpu = navigator.gpu

        const adapter = await gpu.requestAdapter();
        if (!adapter) {
            throw Error("Couldn't request WebGPU adapter.");
        }
        this.device = await adapter.requestDevice();

        this.context = canvas.getContext("webgpu")
        const canvasFormat = gpu.getPreferredCanvasFormat()

        this.context.configure({
            device: this.device,
            format: canvasFormat,
            alphaMode: "premultiplied"
        })

        this.setupMiddleLineRendering(canvasFormat);
        this.setupPaddleRendering(canvasFormat);
        this.setupBallRendering(canvasFormat)
    }

    setupPaddleRendering(canvasFormat) {
        const paddleUniformArray = new Float32Array([-0.5, 0, 0.5, 0]);
        this.paddleUniformBuffer = this.device.createBuffer({
            label: "paddle Uniforms",
            size: paddleUniformArray.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.device.queue.writeBuffer(this.paddleUniformBuffer, 0, paddleUniformArray);

        const paddleShaderModule = this.device.createShaderModule({
            label: 'paddle shader',
            code: paddleShader
        });

        this.paddlePipeline = this.device.createRenderPipeline({
            label: "paddle",
            layout: "auto",
            vertex: {
                module: paddleShaderModule,
                entryPoint: "vertexMain",
            },
            fragment: {
                module: paddleShaderModule,
                entryPoint: "fragmentMain",
                targets: [{
                    format: canvasFormat
                }]
            }
        });

        this.paddleBindGroup = this.device.createBindGroup({
            label: "paddle position bind group",
            layout: this.paddlePipeline.getBindGroupLayout(0),
            entries: [{
                binding: 0,
                resource: {buffer: this.paddleUniformBuffer}
            }],
        });
    }

    setupBallRendering(canvasFormat) {
        const ballPositionsStorageArray = new Float32Array([0, 0]);
        this.ballPositionsStorageBuffer = this.device.createBuffer({
            label: "ball positions storage",
            size: ballPositionsStorageArray.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });

        this.device.queue.writeBuffer(this.ballPositionsStorageBuffer, 0, ballPositionsStorageArray);

        const ballShaderModule = this.device.createShaderModule({
            label: 'ball shader',
            code: ballShader
        });

        this.ballPipeline = this.device.createRenderPipeline({
            label: "ball",
            layout: "auto",
            vertex: {
                module: ballShaderModule,
                entryPoint: "vertexMain",
            },
            fragment: {
                module: ballShaderModule,
                entryPoint: "fragmentMain",
                targets: [{
                    format: canvasFormat
                }]
            }
        });

        this.ballPositionBindGroup = this.device.createBindGroup({
            label: "ball position bind group",
            layout: this.ballPipeline.getBindGroupLayout(0),
            entries: [{
                binding: 0,
                resource: {buffer: this.ballPositionsStorageBuffer}
            }],
        });
    }

    setupMiddleLineRendering(canvasFormat) {
        const middleLineShaderModule = this.device.createShaderModule({
            label: 'middle line shader',
            code: middleLineShader
        });

        this.middleLinePipeline = this.device.createRenderPipeline({
            label: "middle-line",
            layout: "auto",
            vertex: {
                module: middleLineShaderModule,
                entryPoint: "vertexMain",
            },
            fragment: {
                module: middleLineShaderModule,
                entryPoint: "fragmentMain",
                targets: [{
                    format: canvasFormat
                }]
            },
            primitive: {
                topology: "line-list"
            }
        })
    }

    render = ({ paddle1Y, paddle2Y, ballPosition }) => {
        const encoder = this.device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
            colorAttachments: [{
                view: this.context.getCurrentTexture().createView(),
                loadOp: "clear",
                storeOp: "store",
                clearValue: { r: 0, g: 0, b: 0, a: 1 },
            }]
        });

        pass.setPipeline(this.middleLinePipeline)
        pass.draw(2)

        const paddleUniformArray = new Float32Array([-0.5, paddle1Y, 0.5, paddle2Y]);
        this.device.queue.writeBuffer(this.paddleUniformBuffer, 0, paddleUniformArray);

        pass.setPipeline(this.paddlePipeline)
        pass.setBindGroup(0, this.paddleBindGroup)
        pass.draw(6, 2)

        const ballPositionsStorageArray = new Float32Array([ballPosition.x, ballPosition.y]);
        this.device.queue.writeBuffer(this.ballPositionsStorageBuffer, 0, ballPositionsStorageArray);

        pass.setPipeline(this.ballPipeline)
        pass.setBindGroup(0, this.ballPositionBindGroup)
        pass.draw(6)

        pass.end()
        this.device.queue.submit([encoder.finish()]);
    }
}
