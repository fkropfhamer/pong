import rectangleShader from './rectangle.wgsl?raw'
import middleLineShader from './middleLine.wgsl?raw'
import paddleShader from './paddle.wgsl?raw'

export class WebGPURenderer {
    isSupported = () => {
        return !navigator.gpu
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
                resource: { buffer: this.paddleUniformBuffer }
            }],
        });
    }

    render = ({ paddle1Y, paddle2Y }) => {
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


        pass.end()
        this.device.queue.submit([encoder.finish()]);
    }
}
