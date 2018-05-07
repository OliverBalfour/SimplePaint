
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
		document.querySelector(view[section].className).classList.add('hidden');
	} else {
		document.documentElement.style.setProperty(view[section].prop, view[section].size);
		document.querySelector(view[section].className).classList.remove('hidden');
	}

	view[section].open = !view[section].open;
	updateCanvasContainerSize();
}

function toggleMenu () {
	function closeMenu () {
		toggleView('menu');
		view.menu.promptAgain = false;
	}

	if (view.menu.open && !view.menu.altDown && !view.menu.promptAgain) {
		closeMenu();
	} else if (view.menu.open && !view.menu.altDown) {
		modal.confirm(
			'Are you sure you want to close the menu?',
			'You can re-open the menu by holding Alt/Option or pressing Ctrl+M',
			'confirm'
		)
			.then(closeMenu)
			.catch(() => {});
	} else {
		toggleView('menu');
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

// Other stuff

// Mouse position indicators
document.addEventListener('mousemove', (e) => {
	mouse.x = e.clientX;
	mouse.y = e.clientY;
	getRelativePosition();

	let colour = 'darkred',
		xel = document.querySelector('.js-x-coord'),
		yel = document.querySelector('.js-y-coord');

	xel.innerText = Math.round(mouse.rx);
	yel.innerText = Math.round(mouse.ry);

	if (mouse.rx < 0 || mouse.rx > croquis.getCanvasWidth())
		xel.style.background = colour;
	else
		xel.style.background = '';

	if (mouse.ry < 0 || mouse.ry > croquis.getCanvasHeight())
		yel.style.background = colour;
	else
		yel.style.background = '';
});
