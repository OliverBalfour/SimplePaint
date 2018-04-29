// Create croquis instance
const croquis = new Croquis();

// Initialise brush
const brush = new Croquis.Brush();
brush.setSize(30);
brush.setColor('#000');
brush.setSpacing(0.2);
croquis.setTool(brush);
croquis.setToolStabilizeLevel(10);
croquis.setToolStabilizeWeight(0.5);

const croquisElement = croquis.getDOMElement();
const canvasContainer = document.querySelector('.canvases');
canvasContainer.appendChild(croquisElement);

// Initialise croquis
croquis.lockHistory();
let canvasSize = canvasContainer.getBoundingClientRect();
croquis.setCanvasSize(canvasSize.width, canvasSize.height);
croquis.addLayer();
croquis.fillLayer('#fff');
croquis.addLayer();
croquis.selectLayer(1);
croquis.unlockHistory();

const mouse = {
	x: 0, y: 0,
	rx: 0, ry: 0
}

// Register mouse events

function canvasPointerDown(e) {
	mouse.x = e.clientX;
	mouse.y = e.clientY;
	setPointerEvent(e);
	getRelativePosition();
	if (pointerEventsNone)
		canvasContainer.style.setProperty('cursor', 'none');
	if (e.pointerType === "pen" && e.button == 5)
		croquis.setPaintingKnockout(true);
	croquis.down(mouse.rx, mouse.ry, e.pointerType === "pen" ? e.pressure : 1);
	document.addEventListener('pointermove', canvasPointerMove);
	document.addEventListener('pointerup', canvasPointerUp);
}
function canvasPointerMove(e) {
	setPointerEvent(e);
	mouse.x = e.clientX;
	mouse.y = e.clientY;
	getRelativePosition();
	croquis.move(mouse.rx, mouse.ry, e.pointerType === "pen" ? e.pressure : 1);
}
function canvasPointerUp(e) {
	setPointerEvent(e);
	mouse.x = e.clientX;
	mouse.y = e.clientY;
	getRelativePosition();
	if (pointerEventsNone)
		canvasContainer.style.setProperty('cursor', 'crosshair');
	croquis.up(mouse.rx, mouse.ry, e.pointerType === "pen" ? e.pressure : 1);
	if (e.pointerType === "pen" && e.button == 5)
		setTimeout(function() {croquis.setPaintingKnockout(selectEraserCheckbox.checked)}, 30);//timeout should be longer than 20 (knockoutTickInterval in Croquis)
	document.removeEventListener('pointermove', canvasPointerMove);
	document.removeEventListener('pointerup', canvasPointerUp);
}
croquisElement.addEventListener('pointerdown', canvasPointerDown);

function clearLayer () {
	croquis.clearLayer();
}
function fillLayer () {
	var rgb = tinycolor(brush.getColor()).toRgb();
	croquis.fillLayer(tinycolor({
		r: rgb.r,
		g: rgb.g,
		b: rgb.b,
		a: croquis.getPaintingOpacity()
	}).toRgbString());
}

// Brush images

let circleBrush = document.getElementById('circle-brush'),
	brushImages = Array.from(document.getElementsByClassName('brush-image')),
	currentBrush = circleBrush;

brushImages.forEach(brush => {
	brush.addEventListener('pointerdown', brushImagePointerDown);
});

function brushImagePointerDown(e) {
	var image = e.currentTarget;
	currentBrush.className = 'brush-image';
	image.className = 'brush-image on';
	currentBrush = image;
	if (image == circleBrush)
		image = null;
	brush.setImage(image);
	updatePointer();
}

// checking pointer-events property support
var pointerEventsNone = document.documentElement.style.pointerEvents !== undefined;

//brush pointer
var brushPointerContainer = document.createElement('div');
brushPointerContainer.className = 'brush-pointer';

if (pointerEventsNone) {
	croquisElement.addEventListener('pointerover', function () {
		croquisElement.addEventListener('pointermove', croquisPointerMove);
		document.body.appendChild(brushPointerContainer);
	});
	croquisElement.addEventListener('pointerout', function () {
		croquisElement.removeEventListener('pointermove', croquisPointerMove);
		brushPointerContainer.parentElement.removeChild(brushPointerContainer);
	});
}

function croquisPointerMove(e) {
	mouse.x = e.clientX;
	mouse.y = e.clientY;
	if (pointerEventsNone) {
		var x = mouse.x + window.pageXOffset;
		var y = mouse.y + window.pageYOffset;
		brushPointerContainer.style.setProperty('left', x + 'px');
		brushPointerContainer.style.setProperty('top', y + 'px');
	}
}

// Render options

var toolStabilizeLevelSlider =
	document.getElementById('tool-stabilize-level-slider');
var toolStabilizeWeightSlider =
	document.getElementById('tool-stabilize-weight-slider');
toolStabilizeLevelSlider.value = croquis.getToolStabilizeLevel();
toolStabilizeWeightSlider.value = croquis.getToolStabilizeWeight() * 100;

// Brush options

let selectEraserCheckbox = document.getElementById('select-eraser-checkbox'),
	brushOpacitySlider = document.getElementById('brush-opacity-slider'),
	brushFlowSlider = document.getElementById('brush-flow-slider'),
	brushSpacingSlider = document.getElementById('brush-spacing-slider'),
	brushAngleSlider = document.getElementById('brush-angle-slider'),
	brushRotateToDirectionCheckbox = document.getElementById('brush-rotate-to-direction-checkbox');

brushOpacitySlider.value = croquis.getPaintingOpacity() * 100;
brushFlowSlider.value = brush.getFlow() * 100;
brushSpacingSlider.value = brush.getSpacing() * 100;
brushAngleSlider.value = brush.getAngle();
brushRotateToDirectionCheckbox.checked = brush.getRotateToDirection();

toolStabilizeLevelSlider.onchange = function () {
	croquis.setToolStabilizeLevel(toolStabilizeLevelSlider.value);
	toolStabilizeLevelSlider.value = croquis.getToolStabilizeLevel();
}
toolStabilizeWeightSlider.onchange = function () {
	croquis.setToolStabilizeWeight(toolStabilizeWeightSlider.value * 0.01);
	toolStabilizeWeightSlider.value = croquis.getToolStabilizeWeight() * 100;
}

selectEraserCheckbox.onchange = function () {
	croquis.setPaintingKnockout(selectEraserCheckbox.checked);
}
brushOpacitySlider.onchange = function () {
	croquis.setPaintingOpacity(brushOpacitySlider.value * 0.01);
}
brushFlowSlider.onchange = function () {
	brush.setFlow(brushFlowSlider.value * 0.01);
}
brushSpacingSlider.onchange = function () {
	brush.setSpacing(brushSpacingSlider.value * 0.01);
}
brushAngleSlider.onchange = function () {
	brush.setAngle(brushAngleSlider.value);
	updatePointer();
}
brushRotateToDirectionCheckbox.onchange = function () {
	brush.setRotateToDirection(brushRotateToDirectionCheckbox.checked);
}



// Colour picker

const colourPickerPreview = document.querySelector('.colour-picker-preview');
const picker = new ColourPicker(c => {
	colourPickerPreview.children[0].style.backgroundColor = c.toHslString();
	colourPickerPreview.children[0].innerText = c.toHexString();
	colourPickerPreview.children[0].style.color = c.isDark() ? 'white' : 'black';
	brush.setColor(c);
	updatePointer();
}, 280);
document.querySelector('.picker').appendChild(picker.element);

let backgroundCheckerImage;
(function () {
	backgroundCheckerImage = document.createElement('canvas');
	backgroundCheckerImage.width = backgroundCheckerImage.height = 20;
	var backgroundImageContext = backgroundCheckerImage.getContext('2d');
	backgroundImageContext.fillStyle = '#fff';
	backgroundImageContext.fillRect(0, 0, 20, 20);
	backgroundImageContext.fillStyle = '#ccc';
	backgroundImageContext.fillRect(0, 0, 10, 10);
	backgroundImageContext.fillRect(10, 10, 20, 20);
})();
colourPickerPreview.style.backgroundImage = 'url(' + backgroundCheckerImage.toDataURL() + ')';

// Brush options

document.querySelector('.line-thickness').onchange = e => {
	brush.setSize(parseFloat(e.target.value));
	document.querySelector('.js-line-thickness').innerText = brush.getSize();
	updatePointer();
}

// Mouse position indicators

document.addEventListener('mousemove', (e) => {
	mouse.x = e.clientX;
	mouse.y = e.clientY;
	getRelativePosition();

	let xel = document.querySelector('.js-x-coord'),
		yel = document.querySelector('.js-y-coord');
	xel.innerText = mouse.rx;
	yel.innerText = mouse.ry;
	if (
		mouse.rx < 0 || mouse.ry < 0 ||
		mouse.rx > canvasSize.width || mouse.ry > canvasSize.height
	) {
		xel.style.color = yel.style.color = 'grey';
	} else {
		xel.style.color = yel.style.color = 'black';
	}
});

// Keyboard shortcuts

Mousetrap.bind(['ctrl+y', 'ctrl+shift+z', 'meta+y', 'meta+shift+z'], croquis.redo);
Mousetrap.bind(['ctrl+z', 'meta+z'], croquis.undo);


// Utilities


function setPointerEvent(e) {
	if (e.pointerType !== "pen" && Croquis.Tablet.pen() && Croquis.Tablet.pen().pointerType) {//it says it's not a pen but it might be a wacom pen
		e.pointerType = "pen";
		e.pressure = Croquis.Tablet.pressure();
		if (Croquis.Tablet.isEraser()) {
			Object.defineProperties(e, {
				"button": { value: 5 },
				"buttons": { value: 32 }
			});
		}
	}
}

function updatePointer() {
	if (pointerEventsNone) {
		var image = currentBrush;
		var threshold;
		if (currentBrush == circleBrush) {
			image = null;
			threshold = 0xff;
		}
		else {
			threshold = 0x30;
		}
		var brushPointer = Croquis.createBrushPointer(
			image, brush.getSize(), brush.getAngle(), threshold, true);
		brushPointer.style.setProperty('margin-left',
			'-' + (brushPointer.width * 0.5) + 'px');
		brushPointer.style.setProperty('margin-top',
			'-' + (brushPointer.height * 0.5) + 'px');
		brushPointerContainer.innerHTML = '';
		brushPointerContainer.appendChild(brushPointer);
	}
}
updatePointer();

function getRelativePosition() {
	var rect = croquisElement.getBoundingClientRect();
	mouse.rx = mouse.x - rect.left;
	mouse.ry = mouse.y - rect.top;
	return { x: mouse.rx, y: mouse.ry };
}
