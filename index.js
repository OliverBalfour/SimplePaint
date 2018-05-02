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

{
	let layers = croquis.getLayers();
	layers[0].setAttribute('data-name', 'Background');
	layers[1].setAttribute('data-name', 'Layer 1');
}

const mouse = {
	x: 0, y: 0,
	rx: 0, ry: 0
}
let tool = 'pen';

// Register mouse events

function canvasPointerDown(e) {
	mouse.x = e.clientX;
	mouse.y = e.clientY;
	setPointerEvent(e);
	getRelativePosition();
	if (pointerEventsNone)
		canvasContainer.style.setProperty('cursor', 'none');
	if (tool === 'picker')
		picker.setColour(tinycolor(croquis.eyeDrop(mouse.rx, mouse.ry)));
	if (tool === 'eraser' || (tool === 'pen' && e.pointerType === 'pen' && e.button == 5))
		croquis.setPaintingKnockout(true);
	else
		croquis.setPaintingKnockout(false);
	if (tool !== 'picker')
		croquis.down(mouse.rx, mouse.ry, e.pointerType === 'pen' ? e.pressure : 1);
	if (tool !== 'line')
		document.addEventListener('pointermove', canvasPointerMove);
	document.addEventListener('pointerup', canvasPointerUp);
}
function canvasPointerMove(e) {
	setPointerEvent(e);
	mouse.x = e.clientX;
	mouse.y = e.clientY;
	getRelativePosition();
	if (tool === 'picker')
		picker.setColour(tinycolor(croquis.eyeDrop(mouse.rx, mouse.ry)));
	else
		croquis.move(mouse.rx, mouse.ry, e.pointerType === 'pen' ? e.pressure : 1);
}
function canvasPointerUp(e) {
	setPointerEvent(e);
	mouse.x = e.clientX;
	mouse.y = e.clientY;
	getRelativePosition();
	if (pointerEventsNone)
		canvasContainer.style.setProperty('cursor', 'crosshair');
	if (tool === 'picker')
		picker.setColour(tinycolor(croquis.eyeDrop(mouse.rx, mouse.ry)));
	else
		croquis.up(mouse.rx, mouse.ry, e.pointerType === 'pen' ? e.pressure : 1);
	if (e.pointerType === 'pen' && e.button == 5)
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

let circleBrushes = Array.from(document.getElementsByClassName('circle-brush')),
	brushImages = Array.from(document.getElementsByClassName('brush-image')),
	currentBrush = circleBrushes[0];

brushImages.forEach(brush => {
	brush.addEventListener('pointerdown', brushImagePointerDown);
});

function brushImagePointerDown(e) {
	var image = e.currentTarget;
	currentBrush.classList.remove('on');
	image.classList.add('on');
	currentBrush = image;

	[ 'opacity', 'size', 'flow', 'spacing', 'angle' ]
	.forEach(attr => {
		if (image.getAttribute('data-' + attr)) {
			let el = document.querySelector('.brush-' + attr);
			el.value = image.getAttribute('data-' + attr);
			el.onchange({ target: el });
		}
	});

	if (image.getAttribute('data-rotate')) {
		let el = document.querySelector('.brush-rotate');
		el.checked = (image.getAttribute('data-rotate') === 'true');
		el.onchange({ target: el });
	}

	if (circleBrushes.indexOf(image) !== -1)
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

// Render options

// Stabilizer level
document.querySelector('.render-stabilizer').value
 = document.querySelector('.js-render-stabilizer').innerText
 = croquis.getToolStabilizeLevel();
document.querySelector('.render-stabilizer').onchange = e => {
	croquis.setToolStabilizeLevel(parseFloat(e.target.value));
	document.querySelector('.js-render-stabilizer').innerText = croquis.getToolStabilizeLevel();
}

// Weight
document.querySelector('.render-weight').value
 = document.querySelector('.js-render-weight').innerText
 = croquis.getToolStabilizeWeight() * 100;
document.querySelector('.render-weight').onchange = e => {
	croquis.setToolStabilizeWeight(parseFloat(e.target.value) * 0.01);
	document.querySelector('.js-render-weight').innerText = croquis.getToolStabilizeWeight() * 100;
}

// Brush options

// Brush opacity
document.querySelector('.brush-opacity').value
 = document.querySelector('.js-brush-opacity').innerText
 = croquis.getPaintingOpacity() * 100;
document.querySelector('.brush-opacity').onchange = e => {
	croquis.setPaintingOpacity(parseFloat(e.target.value) * 0.01);
	document.querySelector('.js-brush-opacity').innerText = croquis.getPaintingOpacity() * 100;
}

// Brush size
document.querySelector('.brush-size').value
 = document.querySelector('.js-brush-size').innerText
 = brush.getSize();
document.querySelector('.brush-size').onchange = e => {
	brush.setSize(parseFloat(e.target.value));
	document.querySelector('.js-brush-size').innerText = brush.getSize();
	updatePointer();
}

// Brush flow
document.querySelector('.brush-flow').value
 = document.querySelector('.js-brush-flow').innerText
 = brush.getFlow() * 100;
document.querySelector('.brush-flow').onchange = e => {
	brush.setFlow(parseFloat(e.target.value) * 0.01);
	document.querySelector('.js-brush-flow').innerText = brush.getFlow() * 100;
}

// Brush spacing
document.querySelector('.brush-spacing').value
 = document.querySelector('.js-brush-spacing').innerText
 = brush.getSpacing() * 100;
document.querySelector('.brush-spacing').onchange = e => {
	brush.setSpacing(parseFloat(e.target.value) * 0.01);
	document.querySelector('.js-brush-spacing').innerText = brush.getSpacing() * 100;
}

// Brush angle
document.querySelector('.brush-angle').value
 = document.querySelector('.js-brush-angle').innerText
 = brush.getAngle();
document.querySelector('.brush-angle').onchange = e => {
	brush.setAngle(parseFloat(e.target.value));
	document.querySelector('.js-brush-angle').innerText = brush.getAngle();
}

// Rotate brush to direction
document.querySelector('.brush-rotate').checked = brush.getRotateToDirection();
document.querySelector('.brush-rotate').onchange = e => {
	brush.setRotateToDirection(e.target.checked);
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

// Tools

function changeTool (el) {
	tool = el.getAttribute('data-tool');
}

// Utility functions

function setPointerEvent(e) {
	if (e.pointerType !== 'pen' && Croquis.Tablet.pen() && Croquis.Tablet.pen().pointerType) {//it says it's not a pen but it might be a wacom pen
		e.pointerType = 'pen';
		e.pressure = Croquis.Tablet.pressure();
		if (Croquis.Tablet.isEraser()) {
			Object.defineProperties(e, {
				'button': { value: 5 },
				'buttons': { value: 32 }
			});
		}
	}
}

function updatePointer() {
	if (pointerEventsNone) {
		var image = currentBrush;
		var threshold;
		if (circleBrushes.indexOf(currentBrush) !== -1) {
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

// Upload a brush

function uploadBrush () {
	getImage(
		'Please upload an image',
		'The image will be added as a brush. Make sure to use transparency and not white for empty spaces within the brush.'
	)
		.then((data) => {
			let img = document.createElement('img');
			document.querySelector('#brush-image-shelf').insertBefore(
				img,
				document.querySelector('.new-brush-button')
			);
			img.classList.add('brush-image');
			img.src = data;
			img.addEventListener('pointerdown', brushImagePointerDown);
		})
		.catch((e) => {
			alert('Error:\n' + e);
		});
}

// resolve returns image data, reject returns error
let getImagePromise = { resolve: null, reject: null };
function getImage (title, info) {
	return new Promise ((resolve, reject) => {
		getImagePromise = {resolve, reject};
		document.querySelector('.modal-image-upload').children[0].innerText = title;
		document.querySelector('.modal-image-upload').children[1].innerText = info;
		openModal('modal-image-upload');
	});
}
function uploadImage () {
	if (document.querySelector('.image-upload-input').files.length) {
		let reader = new FileReader();
		reader.readAsDataURL(document.querySelector('.image-upload-input').files[0]);
		reader.addEventListener('load', () => {
			closeModal('modal-image-upload');
			getImagePromise.resolve(reader.result);
			getImagePromise = { resolve: null, reject: null };
		});
	}
}

function openModal (className) {
	document.querySelector('.modals').classList.remove('hidden');
	document.querySelector('.' + className).classList.remove('hidden');
}
function closeModal (className) {
	document.querySelector('.modals').classList.add('hidden');
	document.querySelector('.' + className).classList.add('hidden');
}

function updateLayers () {
	let shelf = document.querySelector('.layers-shelf'),
		num = croquis.getLayerCount(),
		layers = croquis.getLayers();

	shelf.innerHTML = '';

	for (let i = 0; i < num; i++) {
		let el = document.createElement('div');
		el.classList.add('layer');
		el.addEventListener('click', layerClick);
		el.innerHTML = layers[i].getAttribute('data-name')
		 + "<div class='remove-layer-button small-button' onclick='removeLayer(this)'>&times;</div>";
		shelf.appendChild(el);
	}

	Array.from(shelf.children)[croquis.getCurrentLayerIndex()].classList.add('active');
}
updateLayers();

function layerClick (e) {
	let layers = Array.from(e.target.parentElement.children);
	croquis.selectLayer(layers.indexOf(e.target));
	layers.forEach(layer => {
		layer.classList.remove('active');
	});
	layers[croquis.getCurrentLayerIndex()].classList.add('active');
}

function addLayer () {
	let layerName = prompt('Layer name:');
	croquis.addLayer(croquis.getLayerCount()).setAttribute('data-name', layerName);
	updateLayers();
}

function removeLayer (el) {
	croquis.removeLayer(Array.from(el.parentElement.parentElement.children).indexOf(el.parentElement));
	updateLayers();
}
