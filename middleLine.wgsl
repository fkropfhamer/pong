const middleLine = array<vec2f, 2>(
    vec2f(0.0, -0.9),
    vec2f(0.0, 0.9)
);

@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
    var pos: vec2f = middleLine[index];

    return vec4f(pos, 0, 1);
}

@fragment
fn fragmentMain() -> @location(0) vec4f {
    return vec4f(1, 1, 1, 1);
}