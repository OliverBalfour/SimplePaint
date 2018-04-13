
const pen = {
	colour: 'black',
	thickness: 6
}

function dispatchEvent(event, ctx, mouse) {
	if (tools[tool].hasOwnProperty(event))
		tools[tool][event](ctx, mouse);
}

const tools = {
	pen: {
		leftMouseDown: (apply, ctx, mouse) => {
			ctx.strokeStyle = pen.colour;
			ctx.lineWidth = pen.thickness;
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			ctx.beginPath();
			ctx.moveTo(mouse.x, mouse.y);
		},
		leftMouseMove: (apply, ctx, mouse) => {
			ctx.lineTo(mouse.x, mouse.y);
			ctx.stroke();
		},
		leftMouseUp: (apply, ctx, mouse) => {
			ctx.closePath();
			apply();
		}
	},
	line: {
		leftMouseDown: (apply, ctx, mouse) => {
			ctx.strokeStyle = pen.colour;
			ctx.lineWidth = pen.thickness;
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			ctx.beginPath();
			ctx.moveTo(mouse.x, mouse.y);
		},
		leftMouseMove: (apply, ctx, mouse) => {
		},
		leftMouseUp: (apply, ctx, mouse) => {
			ctx.lineTo(mouse.x, mouse.y);
			ctx.stroke();
			ctx.closePath();
			apply();
		}
	}
}
