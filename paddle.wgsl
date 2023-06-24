const rectangle = array<vec2f, 6>(
    vec2f(-0.02, -0.2),
    vec2f(0.02, -0.2),
    vec2f(0.02, 0.2),

    vec2f(-0.02, -0.2),
    vec2f(0.02, 0.2),
    vec2f(-0.02, 0.2),
);

struct VertexInput {
    @builtin(vertex_index) index: u32,
    @builtin(instance_index) instance: u32
};

struct VertexOutput {
    @builtin(position) pos: vec4f
};

@group(0) @binding(0) var<uniform> positions: vec4f;

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
    var i = input.instance * 2;

    var x = positions[0 + i];
    var y = positions[1 + i];

    var pos = rectangle[input.index] + vec2f(x, y);

    var output: VertexOutput;
    output.pos = vec4f(pos, 0, 1);

    return output;
}

@fragment
fn fragmentMain() -> @location(0) vec4f {
    return vec4f(1, 0, 0, 1);
}