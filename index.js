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
croquis.setUndoLimit(100);
croquis.unlockHistory();

{
	let layers = croquis.getLayers();
	layers[0].setAttribute('data-name', 'Background');
	layers[1].setAttribute('data-name', 'Canvas');
}

const mouse = {
	x: 0, y: 0,
	rx: 0, ry: 0
}
let tool = 'pen';

const rootStyle = getComputedStyle(document.documentElement);
const view = {
	menu: {
		open: true,
		promptAgain: true, // has the user been prompted about wanting to close the menu?
		altDown: false, // is the user pressing alt to hold the menu open?
		prop: '--menu-height',
		size: rootStyle.getPropertyValue('--menu-height')
	},
	statusBar: {
		open: true,
		prop: '--footer-height',
		size: rootStyle.getPropertyValue('--footer-height')
	},
	toolBar: {
		open: true,
		prop: '--toolbar-width',
		size: rootStyle.getPropertyValue('--toolbar-width')
	},
	toolOptions: {
		open: true,
		prop: '--options-width',
		size: rootStyle.getPropertyValue('--options-width')
	},
	layerThumbs: true
}

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
	// only pick 1/10 of the time to reduce lag
	if (tool === 'picker' && Math.random() < 0.1)
		picker.setColour(tinycolor(croquis.eyeDrop(mouse.rx, mouse.ry)));
	else if (tool !== 'picker')
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
	modal.image(
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

// Upload image

function openImage () {
	modal.image(
		'Please upload an image',
		'The image will be blitted 1-to-1 to the canvas. (The canvas is not resized, this will be fixed later.)'
	)
		.then((data) => {
			let img = document.createElement('img');
			img.src = data;
			img.onload = () => {
				let canvas = croquis.getLayers()[croquis.getCurrentLayerIndex()].children[0],
					ctx = canvas.getContext('2d');
				ctx.drawImage(img, 0, 0);
			}
		})
		.catch((e) => {
			alert('Error:\n' + e);
		});
}
function openImageAsLayer () {
	modal.image(
		'Please upload an image to use as a layer',
		'The image will be blitted 1-to-1 to the canvas. (The image is not resized, this will be fixed later.)'
	)
		.then((data) => {
			let img = document.createElement('img');
			img.src = data;
			croquis.addLayer(croquis.getLayerCount()).setAttribute('data-name', 'Pasted image');

			let layers = Array.from(document.querySelector('.layers-shelf').children);
			croquis.selectLayer(layers.length - 1);
			layers.forEach(layer => {
				layer.classList.remove('active');
			});
			layers[croquis.getCurrentLayerIndex()].classList.add('active');

			img.onload = () => {
				let canvas = croquis.getLayers()[layers.length].children[0],
					ctx = canvas.getContext('2d');
				ctx.drawImage(img, 0, 0);
				updateLayers();
			}
		})
		.catch((e) => {
			alert('Error:\n' + e);
		});
}

// Layers

function getLayerThumbnail (i) {
	let w = croquis.getCanvasWidth(),
		h = croquis.getCanvasHeight(),
		size = 32,
		wm = w > h ? size : w / h * size,
		hm = h > w ? size : h / w * size;

	return croquis.createLayerThumbnail(i, wm, hm);
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

		el.innerHTML = (view.layerThumbs ? "<img src='" + getLayerThumbnail(i).toDataURL('image/png') + "' />" : '')
		 + '<span>' + layers[i].getAttribute('data-name') + '</span>'
		 + "<div class='remove-layer-button small-button' onclick='removeLayer(this)'>&times;</div>";

		shelf.appendChild(el);
	}

	Array.from(shelf.children)[croquis.getCurrentLayerIndex()].classList.add('active');
}
updateLayers();

function updateLayerThumbnails () {
	Array.from(document.querySelectorAll('.layer img')).forEach((img, i) => {
		img.src = getLayerThumbnail(i).toDataURL('image/png');
	});
}

function layerClick (e) {
	// If no children, it must be the child <span> or <img> and not the parent layer (which we want)
	let layer = e.target;
	if (!e.target.children.length)
		layer = e.target.parentElement;

	let layers = Array.from(layer.parentElement.children);
	croquis.selectLayer(layers.indexOf(layer));
	layers.forEach(l => {
		l.classList.remove('active');
	});
	layer.classList.add('active');
}

function addLayer () {
	modal.prompt('Please enter a name for the new layer', '', 'text')
		.then((name) => {
			croquis.addLayer(croquis.getLayerCount()).setAttribute('data-name', name);
			croquis.selectLayer(croquis.getLayerCount() - 1);
			updateLayers();
		})
		.catch((e) => {
			alert('Error:\n' + e);
		});
}

function removeLayer (el) {
	croquis.removeLayer(Array.from(el.parentElement.parentElement.children).indexOf(el.parentElement));
	updateLayers();
}

function removeActiveLayer () {
	croquis.removeLayer(croquis.getCurrentLayerIndex());
	updateLayers();
}

// Export

let lastImageExport = 'image/png';
function exportImageAs (el, ext) {
	const c = croquis.createFlattenThumbnail();
	let type;
	switch (ext) {
		case 'png':
			type = 'image/png'; break;
		case 'jpg':
		case 'jpeg':
			type = 'image/jpeg'; break;
		case 'last':
		default:
			type = lastImageExport;
	}
	lastImageExport = type;

	el.parentElement.setAttribute('href', c.toDataURL(type));
	el.parentElement.setAttribute(
		'download',
		'image.' + (
			ext !== 'last' ? ext
			 : (lastImageExport === 'image/png' ? 'png' : 'jpg')
		)
	);
}
