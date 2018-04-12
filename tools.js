
let colour = 'black';
let thickness = 0.1;

function dispatchEvent(event, ctx, mouse) {
	if (tools[tool].hasOwnProperty(event))
		tools[tool][event](ctx, mouse);
}

const tools = {
	pen: {
		leftMouseDown: (ctx, mouse) => {
			ctx.strokeStyle = colour;
			ctx.lineWidth = thickness;
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
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
