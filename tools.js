
const tools = {
	pen: {
		left_down: (ctx, mouse) => {
			ctx.strokeStyle = 'red';
			ctx.strokeWidth = 10;
			ctx.beginPath();
			ctx.moveTo(mouse.x, mouse.y);
		},
		left_drag: (ctx, mouse) => {
			ctx.lineTo(mouse.x, mouse.y);
			ctx.stroke();
		},
		left_up: (ctx, mouse) => {
			ctx.closePath();
		}
	}
}
