
let colour = 'red';

function dispatchEvent(event, ctx, mouse) {
	if (tools[tool].hasOwnProperty(event))
		tools[tool][event](ctx, mouse);
}

const tools = {
	pen: {
		leftMouseDown: (ctx, mouse) => {
			ctx.strokeStyle = colour;
			ctx.strokeWidth = 10;
			ctx.beginPath();
			ctx.moveTo(mouse.x, mouse.y);
		},
		leftMouseMove: (ctx, mouse) => {
			ctx.lineTo(mouse.x, mouse.y);
			ctx.stroke();
		},
		leftMouseUp: (ctx, mouse) => {
			ctx.closePath();
		}
	}
}
