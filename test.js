// Initialize croquis
var croquis = new Croquis();

var brush = new Croquis.Brush();
brush.setSize(30);
brush.setColor('#000');
brush.setSpacing(0.2);

croquis.setTool(brush);
croquis.setToolStabilizeLevel(10);
croquis.setToolStabilizeWeight(0.5);

var croquisDOMElement = croquis.getDOMElement();
var canvasArea = document.querySelector('.canvases');
canvasArea.appendChild(croquisDOMElement);

croquis.lockHistory();
let canvasSize = canvasArea.getBoundingClientRect();
croquis.setCanvasSize(canvasSize.width, canvasSize.height);
croquis.addLayer();
croquis.fillLayer('#fff');
croquis.addLayer();
croquis.selectLayer(1);
croquis.unlockHistory();

function canvasPointerDown(e) {
	setPointerEvent(e);
	var pointerPosition = getRelativePosition(e.clientX, e.clientY);
	if (pointerEventsNone)
		canvasArea.style.setProperty('cursor', 'none');
	if (e.pointerType === "pen" && e.button == 5)
		croquis.setPaintingKnockout(true);
	croquis.down(pointerPosition.x, pointerPosition.y, e.pointerType === "pen" ? e.pressure : 1);
	document.addEventListener('pointermove', canvasPointerMove);
	document.addEventListener('pointerup', canvasPointerUp);
}
function canvasPointerMove(e) {
	setPointerEvent(e);
	var pointerPosition = getRelativePosition(e.clientX, e.clientY);
	croquis.move(pointerPosition.x, pointerPosition.y, e.pointerType === "pen" ? e.pressure : 1);
}
function canvasPointerUp(e) {
	setPointerEvent(e);
	var pointerPosition = getRelativePosition(e.clientX, e.clientY);
	if (pointerEventsNone)
		canvasArea.style.setProperty('cursor', 'crosshair');
	croquis.up(pointerPosition.x, pointerPosition.y, e.pointerType === "pen" ? e.pressure : 1);
	if (e.pointerType === "pen" && e.button == 5)
		setTimeout(function() {croquis.setPaintingKnockout(selectEraserCheckbox.checked)}, 30);//timeout should be longer than 20 (knockoutTickInterval in Croquis)
	document.removeEventListener('pointermove', canvasPointerMove);
	document.removeEventListener('pointerup', canvasPointerUp);
}
function getRelativePosition(absoluteX, absoluteY) {
	var rect = croquisDOMElement.getBoundingClientRect();
	return {x: absoluteX - rect.left, y: absoluteY - rect.top};
}
croquisDOMElement.addEventListener('pointerdown', canvasPointerDown);

//clear & fill button ui
var clearButton = document.getElementById('clear-button');
clearButton.onclick = function () {
	croquis.clearLayer();
}
var fillButton = document.getElementById('fill-button');
fillButton.onclick = function () {
	var rgb = tinycolor(brush.getColor()).toRgb();
	croquis.fillLayer(tinycolor({r: rgb.r, g: rgb.g, b: rgb.b,
		a: croquis.getPaintingOpacity()}).toRgbString());
}

//brush images
var circleBrush = document.getElementById('circle-brush');
var brushImages = document.getElementsByClassName('brush-image');
var currentBrush = circleBrush;

Array.prototype.map.call(brushImages, function (brush) {
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
	croquisDOMElement.addEventListener('pointerover', function () {
		croquisDOMElement.addEventListener('pointermove', croquisPointerMove);
		document.body.appendChild(brushPointerContainer);
	});
	croquisDOMElement.addEventListener('pointerout', function () {
		croquisDOMElement.removeEventListener('pointermove', croquisPointerMove);
		brushPointerContainer.parentElement.removeChild(brushPointerContainer);
	});
}

function croquisPointerMove(e) {
	if (pointerEventsNone) {
		var x = e.clientX + window.pageXOffset;
		var y = e.clientY + window.pageYOffset;
		brushPointerContainer.style.setProperty('left', x + 'px');
		brushPointerContainer.style.setProperty('top', y + 'px');
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

var backgroundCheckerImage;
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

// colorPickerChecker.style.backgroundImage = 'url(' +
	backgroundCheckerImage.toDataURL() + ')';

//stabilizer shelf
var toolStabilizeLevelSlider =
	document.getElementById('tool-stabilize-level-slider');
var toolStabilizeWeightSlider =
	document.getElementById('tool-stabilize-weight-slider');
toolStabilizeLevelSlider.value = croquis.getToolStabilizeLevel();
toolStabilizeWeightSlider.value = croquis.getToolStabilizeWeight() * 100;

//brush shelf
var selectEraserCheckbox =
	document.getElementById('select-eraser-checkbox');
var brushOpacitySlider = document.getElementById('brush-opacity-slider');
var brushFlowSlider = document.getElementById('brush-flow-slider');
var brushSpacingSlider = document.getElementById('brush-spacing-slider');
var brushAngleSlider = document.getElementById('brush-angle-slider');
var brushRotateToDirectionCheckbox = document.getElementById('brush-rotate-to-direction-checkbox');
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

// Platform variables
var mac = navigator.platform.indexOf('Mac') >= 0;

//keyboard
document.addEventListener('keydown', documentKeyDown);
function documentKeyDown(e) {
	if (mac ? e.metaKey : e.ctrlKey) {
		switch (e.keyCode) {
		case 89: //ctrl + y
			croquis.redo();
			break;
		case 90: //ctrl + z
			croquis[e.shiftKey ? 'redo' : 'undo']();
			break;
		}
	}
}

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


const el = document.querySelector('.colour-picker-preview');
const picker = new ColourPicker(c => {
	el.style.backgroundColor = c.toHslString();
	el.innerText = c.toHexString();
	el.style.color = c.isDark() ? 'white' : 'black';
	brush.setColor(c);
    updatePointer();
}, 300);
document.querySelector('.picker').appendChild(picker.element);

document.querySelector('.line-thickness').onchange = e => {
    brush.setSize(parseFloat(e.target.value));
    document.querySelector('.js-line-thickness').innerText = brush.getSize();
    updatePointer();
}
