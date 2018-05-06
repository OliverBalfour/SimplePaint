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

// Upload image

function openImage () {
	getImage(
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
	getImage(
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

// resolve returns image data, reject returns error
let getImagePromise = { resolve: null, reject: null };
function getImage (title, info) {
	return new Promise ((resolve, reject) => {
		getImagePromise = {resolve, reject};
		document.querySelector('.modal-image-upload').children[1].innerText = title;
		document.querySelector('.modal-image-upload').children[2].innerText = info;
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

// Prompt modal

// type is a valid type for input elements
let getDataPromise = { resolve: null, reject: null };
function getData (title, info, type) {
	return new Promise ((resolve, reject) => {
		getDataPromise = {resolve, reject};

		let modal = document.querySelector('.modal-prompt'),
			input = document.querySelector('.modal-prompt-input');

		modal.children[1].innerText = title;
		modal.children[2].innerText = info;

		input.type = type;
		input.value = null;

		openModal('modal-prompt');
		input.focus();
	});
}
function finishGetData () {
	closeModal('modal-prompt');
	getDataPromise.resolve(document.querySelector('.modal-prompt-input').value);
	document.querySelector('.modal-prompt-input').value = null;
	getDataPromise = { resolve: null, reject: null };
}

// Confirm/alert modal

// type is 'alert' or 'confirm'
// (determines whether it emulates window.alert or window.confirm)
let getBoolPromise = { resolve: null, reject: null };
function getBool (title, info, type) {
	return new Promise ((resolve, reject) => {
		getBoolPromise = {resolve, reject};

		let modal = document.querySelector('.modal-confirm');

		modal.children[1].innerText = title;
		modal.children[2].innerText = info;

		if (type !== 'confirm')
			document.querySelector('.modal-confirm-button').classList.add('hidden');

		openModal('modal-confirm');
	});
}
function finishGetBool (val) {
	closeModal('modal-confirm');
	if (val)
		getBoolPromise.resolve();
	else
		getBoolPromise.reject();

	getBoolPromise.resolve(val);
	document.querySelector('.modal-confirm-button').classList.remove('hidden');
	getBoolPromise = { resolve: null, reject: null };
}


function openModal (className) {
	document.querySelector('.modals').classList.remove('hidden');
	document.querySelector('.' + className).classList.remove('hidden');
}
function closeModal (className) {
	document.querySelector('.modals').classList.add('hidden');
	document.querySelector('.' + className).classList.add('hidden');
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
	getData('Please enter a name for the new layer', '', 'text')
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

// View menu

document.fullscreenEnabled = document.fullscreenEnabled || document.mozFullScreenEnabled || document.documentElement.webkitRequestFullScreen;

function enterFullscreen (element) {
	if (element.requestFullscreen) {
		element.requestFullscreen();
	} else if (element.mozRequestFullScreen) {
		element.mozRequestFullScreen();
	} else if (element.webkitRequestFullScreen) {
		element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
	}
}
function exitFullscreen () {
	if (document.exitFullscreen) {
		document.exitFullscreen();
	} else if (document.webkitExitFullscreen) {
		document.webkitExitFullscreen();
	} else if (document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
	} else if (document.msExitFullscreen) {
		document.msExitFullscreen();
	}
}

function toggleFullscreen () {
	if (
		!(window.fullScreen || (window.innerWidth == screen.width && window.innerHeight == screen.height))
		&& document.fullscreenEnabled
	)
		enterFullscreen(document.documentElement);
	else
		exitFullscreen();
}

// section must be the name of a child of the `view` object (statusBar etc.)
function toggleView (section) {
	if (view[section].open) {
		document.documentElement.style.setProperty(view[section].prop, '0px');
	} else {
		document.documentElement.style.setProperty(view[section].prop, view[section].size);
	}

	view[section].open = !view[section].open;
}

function toggleMenu () {
	function closeMenu () {
		toggleView('menu');
		document.querySelector('.menu').classList.add('hidden');
		view.menu.promptAgain = false;
	}

	if (view.menu.open && !view.menu.altDown && !view.menu.promptAgain) {
		closeMenu();
	} else if (view.menu.open && !view.menu.altDown) {
		getBool(
			'Are you sure you want to close the menu?',
			'You can re-open the menu by holding Alt/Option or pressing Ctrl+M',
			'confirm'
		)
			.then(closeMenu)
			.catch(() => {});
	} else {
		toggleView('menu');
		document.querySelector('.menu').classList.remove('hidden');
	}
}

let layerThumbInterval;
if (view.layerThumbs)
	layerThumbInterval = setInterval(updateLayerThumbnails, 5 * 1000);

function toggleLayerThumbnails () {
	if (view.layerThumbs) {
		clearInterval(layerThumbInterval);
	} else {
		layerThumbInterval = setInterval(updateLayerThumbnails, 5 * 1000);
	}

	view.layerThumbs = !view.layerThumbs;
	updateLayers();
}

// Keyboard shortcuts

// Import
Mousetrap.bind(['ctrl+o', 'meta+o'], e => {
	e.preventDefault();
	openImage();
});
Mousetrap.bind(['ctrl+alt+o', 'meta+alt+o'], e => {
	e.preventDefault();
	openImageAsLayer();
});

// Export
Mousetrap.bind(['ctrl+s', 'meta+s'], e => {
	e.preventDefault();
	croquis.createFlattenThumbnail().toBlob(blob => {
		saveAs(blob, 'image.' + (lastImageExport === 'image/png' ? 'png' : 'jpg'));
	});
});

// Undo/Redo
Mousetrap.bind(['ctrl+y', 'ctrl+shift+z', 'meta+y', 'meta+shift+z'], croquis.redo);
Mousetrap.bind(['ctrl+z', 'meta+z'], croquis.undo);

// Tools
Mousetrap.bind(['p', 'n'], () => tool = 'pen');
Mousetrap.bind('l', () => tool = 'line');
Mousetrap.bind('e', () => tool = 'eraser');
Mousetrap.bind(['o', 'c'], () => tool = 'picker');

// Distraction free mode
Mousetrap.bind('tab', e => {
	e.preventDefault();
	toggleView('toolBar');
	toggleView('toolOptions');
});

// Toggle menu
Mousetrap.bind(['ctrl+m', 'meta+m'], e => {
	e.preventDefault();
	toggleMenu();
});
Mousetrap.bind('alt', e => {
	e.preventDefault();
	if (!view.menu.open) {
		toggleMenu();
		view.menu.altDown = true;
	}
}, 'keydown');
Mousetrap.bind('alt', e => {
	e.preventDefault();
	if (view.menu.open && view.menu.altDown) {
		toggleMenu();
		view.menu.altDown = false;
	}
}, 'keyup');

// Fullscreen
Mousetrap.bind('f11', toggleFullscreen);
