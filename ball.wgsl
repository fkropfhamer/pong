const rectangle = array<vec2f, 6>(
    vec2f(-0.01, -0.02),
    vec2f(0.01, -0.02),
    vec2f(0.01, 0.02),

    vec2f(-0.01, -0.02),
    vec2f(0.01, 0.02),
    vec2f(-0.01, 0.02),
);

struct VertexInput {
    @builtin(vertex_index) index: u32,
    @builtin(instance_index) instance: u32
};

struct VertexOutput {
    @builtin(position) pos: vec4f
};

@group(0) @binding(0) var<storage> positions: array<f32>;

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
    var indexOffset = input.instance * 2;
    var posOffset = vec2f(positions[indexOffset], positions[indexOffset + 1]);

    var pos = rectangle[input.index] + posOffset;

    var output: VertexOutput;
    output.pos = vec4f(pos, 0, 1);

    return output;
}

@fragment
fn fragmentMain() -> @location(0) vec4f {
    return vec4f(0, 1, 0, 1);
}
