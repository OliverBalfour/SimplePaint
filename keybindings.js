
// Keyboard shortcuts

// New
Mousetrap.bind('mod+n', newImage);

// Import
Mousetrap.bind('mod+o', e => {
	e.preventDefault();
	openImage();
});
Mousetrap.bind('mod+alt+o', e => {
	e.preventDefault();
	openImageAsLayer();
});

// New layer
Mousetrap.bind('mod+alt+n', e => {
	e.preventDefault();
	addLayer();
});

// Export
Mousetrap.bind('mod+s', e => {
	e.preventDefault();
	croquis.createFlattenThumbnail().toBlob(blob => {
		saveAs(blob, 'image.' + (lastImageExport === 'image/png' ? 'png' : 'jpg'));
	});
});

// Undo/Redo
Mousetrap.bind(['mod+y', 'mod+shift+z'], croquis.redo);
Mousetrap.bind('mod+z', croquis.undo);

// Tools
Mousetrap.bind(['p', 'n'], () => changeTool(document.querySelector('img[data-tool="pen"]')));
Mousetrap.bind('l', () => changeTool(document.querySelector('img[data-tool="line"]')));
Mousetrap.bind('e', () => changeTool(document.querySelector('img[data-tool="eraser"]')));
Mousetrap.bind(['o', 'c'], () => changeTool(document.querySelector('img[data-tool="picker"]')));

// Distraction free mode
Mousetrap.bind('tab', e => {
	e.preventDefault();
	toggleView('toolBar');
	toggleView('toolOptions');
});

// Toggle menu
Mousetrap.bind('mod+m', e => {
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

// Zoom in/out, reset zoom
Mousetrap.bind('mod+0', resetZoom);
Mousetrap.bind('mod+9', e => {
	e.preventDefault();
	centerImage();
});
Mousetrap.bind(['mod+=', 'mod+shift+='], e => {
	e.preventDefault();
	zoomIn();
});
// Mousetrap isn't working with the Ctrl+Minus shortcut, so I have to manually implement it...
document.addEventListener('keydown', e => {
	if ((e.which === 173 || e.which === 189) && (e.ctrlKey || e.metaKey)) {
		e.preventDefault();
		zoomOut();
	}
})
