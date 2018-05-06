
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
