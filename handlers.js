
{
	const click = (className, handler) =>
		Array.from(document.querySelectorAll('.js-click-' + className))
		.forEach(el => el.addEventListener('pointerdown', handler));

	click('todo', () => {modal.confirm('TODO','','alert')});
	click('openImage', openImage);
	click('openImageAsLayer', openImageAsLayer);
	click('exportImageAsLast', e => {
		exportImageAs(e.target, 'last');
	});
	click('exportImageAsPNG', e => {
		exportImageAs(e.target, 'png');
	});
	click('exportImageAsJPG', e => {
		exportImageAs(e.target, 'jpg');
	});
	click('undo', croquis.undo);
	click('redo', croquis.redo);
	click('toggleFullscreen', toggleFullscreen);
	click('toggleMenu', toggleMenu);
	click('toggleToolBar', () => toggleView('toolBar'));
	click('toggleToolOptions', () => toggleView('toolOptions'));
	click('toggleStatusBar', () => toggleView('statusBar'));
	click('toggleLayerThumbnails', toggleLayerThumbnails);
	click('zoomIn', zoomIn);
	click('zoomOut', zoomOut);
	click('resetZoom', resetZoom);
	click('centerImage', centerImage);
	click('resizeCanvas', resizeCanvas);
	click('addLayer', addLayer);
	click('removeActiveLayer', removeActiveLayer);
	click('clearLayer', clearLayer);
	click('fillLayer', fillLayer);
	click('modalAbout', () => modal.open('modal-about'));
	click('changeTool', e => changeTool(e.target));
	click('uploadBrush', uploadBrush);
	click('modalClose', e => {
		modal.close(e.target.parentElement.className.split(' ')[1]);
	});
	click('modalImageDone', modal.imageDone);
	click('modalPromptDone', modal.promptDone);
	click('modalConfirmDone', e => {
		modal.confirmDone(e.target.getAttribute('data-value') === 'true');
	});
}
