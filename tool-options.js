
// Colour picker

const colourPickerPreview = document.querySelector('.colour-picker-preview');
const picker = new ColourPicker(c => {
	colourPickerPreview.children[0].style.backgroundColor = c.toHslString();
	colourPickerPreview.children[0].innerText = c.toHexString();
	colourPickerPreview.children[0].style.color = c.isDark() ? 'white' : 'black';
	brush.setColor(c);
	updatePointer();
}, 300);
document.querySelector('.picker').appendChild(picker.element);

let backgroundCheckerImage;
(function () {
	backgroundCheckerImage = document.createElement('canvas');
	backgroundCheckerImage.width = backgroundCheckerImage.height = 20;
	var backgroundImageContext = backgroundCheckerImage.getContext('2d');
	backgroundImageContext.fillStyle = '#ddd';
	backgroundImageContext.fillRect(0, 0, 20, 20);
	backgroundImageContext.fillStyle = '#bbb';
	backgroundImageContext.fillRect(0, 0, 10, 10);
	backgroundImageContext.fillRect(10, 10, 20, 20);
})();
colourPickerPreview.style.backgroundImage
 = document.querySelector('.canvases').style.backgroundImage
 = 'url(' + backgroundCheckerImage.toDataURL() + ')';


// Brush images

brushImages.forEach(brush => {
	brush.addEventListener('pointerdown', brushImagePointerDown);
});

function brushImagePointerDown (e) {
	let image = e.currentTarget;
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


// Render options

// Stabilizer level
document.querySelector('.render-stabilizer').value
 = document.querySelector('.js-render-stabilizer').innerText
 = croquis.getToolStabilizeLevel();
document.querySelector('.render-stabilizer').onchange = e => {
	croquis.setToolStabilizeLevel(parseFloat(e.target.value));
	document.querySelector('.js-render-stabilizer').innerText = Math.round(croquis.getToolStabilizeLevel() * 10) / 10;
}

// Weight
document.querySelector('.render-weight').value
 = document.querySelector('.js-render-weight').innerText
 = croquis.getToolStabilizeWeight() * 100;
document.querySelector('.render-weight').onchange = e => {
	croquis.setToolStabilizeWeight(parseFloat(e.target.value) * 0.01);
	document.querySelector('.js-render-weight').innerText = Math.round(croquis.getToolStabilizeWeight() * 100 * 10) / 10;
}


// Brush options

// Brush opacity
document.querySelector('.brush-opacity').value
 = document.querySelector('.js-brush-opacity').innerText
 = croquis.getPaintingOpacity() * 100;
document.querySelector('.brush-opacity').onchange = e => {
	croquis.setPaintingOpacity(parseFloat(e.target.value) * 0.01);
	document.querySelector('.js-brush-opacity').innerText = Math.round(croquis.getPaintingOpacity() * 100 * 10) / 10;
}

// Brush size
document.querySelector('.brush-size').value
 = document.querySelector('.js-brush-size').innerText
 = brush.getSize();
document.querySelector('.brush-size').onchange = e => {
	brush.setSize(parseFloat(e.target.value));
	document.querySelector('.js-brush-size').innerText = Math.round(brush.getSize() * 10) / 10;
	updatePointer();
}

// Brush flow
document.querySelector('.brush-flow').value
 = document.querySelector('.js-brush-flow').innerText
 = brush.getFlow() * 100;
document.querySelector('.brush-flow').onchange = e => {
	brush.setFlow(parseFloat(e.target.value) * 0.01);
	document.querySelector('.js-brush-flow').innerText = Math.round(brush.getFlow() * 100 * 10) / 10;
}

// Brush spacing
document.querySelector('.brush-spacing').value
 = document.querySelector('.js-brush-spacing').innerText
 = brush.getSpacing() * 100;
document.querySelector('.brush-spacing').onchange = e => {
	brush.setSpacing(parseFloat(e.target.value) * 0.01);
	document.querySelector('.js-brush-spacing').innerText = Math.round(brush.getSpacing() * 100 * 10) / 10;
}

// Brush angle
document.querySelector('.brush-angle').value
 = document.querySelector('.js-brush-angle').innerText
 = brush.getAngle();
document.querySelector('.brush-angle').onchange = e => {
	brush.setAngle(parseFloat(e.target.value));
	document.querySelector('.js-brush-angle').innerText = Math.round(brush.getAngle() * 10) / 10;
}

// Rotate brush to direction
document.querySelector('.brush-rotate').checked = brush.getRotateToDirection();
document.querySelector('.brush-rotate').onchange = e => {
	brush.setRotateToDirection(e.target.checked);
}
