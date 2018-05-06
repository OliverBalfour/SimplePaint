
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
		modal.confirm(
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
