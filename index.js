
const val = sel => document.querySelector(sel).value;
const body = document.body;

const canvas = document.querySelector('#canvas-preview');
let canvasBox = canvas.getBoundingClientRect();
setCanvasSize();
const ctx = canvas.getContext('2d');

let debug = true;

const keys = [];
const mouse = {
	x: 0, y: 0,
	// 0 is left, 1 is middle, 2 is right, null is up
	button: null,
	canvas: false,
	drawing: false
}

let tool = 'pen';
function changeTool (button) {
	setTool(button.getAttribute('data-tool'));
}
function setTool (name) {
	tool = name;
}

function boundingBoxCollision (a, b) {
	return a.x < b.x + b.w
		&& a.x + a.w > b.x
		&& a.y < b.y + b.h
		&& a.y + a.h > b.y;
}

function pointCollision (a, p) {
	return p.x > a.x
		&& p.x < a.x + a.w
		&& p.y > a.y
		&& p.y < a.y + a.h;
}

function updateMouseCoords (e) {
	mouse.canvas = pointCollision(
		{
			x: canvasBox.left,
			y: canvasBox.top,
			w: canvasBox.width,
			h: canvasBox.height
		}, {
			x: e.clientX,
			y: e.clientY
		}
	);
	mouse.x = e.clientX - canvasBox.left;
	mouse.y = e.clientY - canvasBox.top;
	document.querySelector('.x-coord').innerText = mouse.x;
	document.querySelector('.y-coord').innerText = mouse.y;
}

function setCanvasSize () {
	canvas.width = canvasBox.width;
	canvas.height = canvasBox.height;
}

body.addEventListener('mousedown', e => {
	updateMouseCoords(e);
	mouse.button = e.button;
	if (mouse.canvas && mouse.button === 0) {
		mouse.drawing = true;
		dispatchEvent('leftMouseDown', ctx, mouse);
	}
});
body.addEventListener('mouseup', e => {
	updateMouseCoords(e);
	if (mouse.drawing && mouse.button === 0) {
		mouse.drawing = false;
		dispatchEvent('leftMouseUp', ctx, mouse);
	}
	mouse.button = null;
});
body.addEventListener('mousemove', e => {
	updateMouseCoords(e);
	if (mouse.drawing && mouse.button === 0)
		dispatchEvent('leftMouseMove', ctx, mouse);
});
body.addEventListener('keydown', e => {
	keys[e.which || e.keyCode] = true;
});
body.addEventListener('keyup', e => {
	keys[e.which || e.keyCode] = false;
});
window.addEventListener('resize', () => {
	canvasBox = canvas.getBoundingClientRect();
	setCanvasSize();
});


const el = document.querySelector('.colour-picker-preview');
const picker = new ColourPicker(c => {
	el.style.backgroundColor = c.toHslString();
	el.innerText = c.toHexString();
	el.style.color = c.isDark() ? 'white' : 'black';
	colour = c;
}, 300);
document.querySelector('.picker').appendChild(picker.element);

document.querySelector('.line-thickness').onchange = e => {
	thickness = parseFloat(e.target.value);
}
