
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
