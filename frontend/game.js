export function initialize(canvas, connection) {
  const ctx = canvas.getContext("2d");

  ctx.fillRect(50, 50, 50, 50);
  ctx.stroke();

  ctx.fillStyle = "blue";

  ctx.fillRect(150, 50, 50, 50);
  ctx.stroke();
}