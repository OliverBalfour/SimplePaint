
const modal = {
	promise: { resolve: null, reject: null },

	open: function (className) {
		document.querySelector('.modals').classList.remove('hidden');
		document.querySelector('.' + className).classList.remove('hidden');
	},
	close: function (className) {
		document.querySelector('.modals').classList.add('hidden');
		document.querySelector('.' + className).classList.add('hidden');
	},

	// resolve returns base64 image data
	image: function (title, info) {
		return new Promise ((resolve, reject) => {
			modal.promise = { resolve, reject };
			document.querySelector('.modal-image-upload').children[1].innerText = title;
			document.querySelector('.modal-image-upload').children[2].innerText = info;
			modal.open('modal-image-upload');
		});
	},
	imageDone: function () {
		if (document.querySelector('.image-upload-input').files.length) {
			let reader = new FileReader();
			reader.readAsDataURL(document.querySelector('.image-upload-input').files[0]);
			reader.addEventListener('load', () => {
				modal.close('modal-image-upload');
				modal.promise.resolve(reader.result);
				modal.promise = { resolve: null, reject: null };
			});
		}
	},

	// type is a valid type for input elements
	prompt: function (title, info, type) {
		return new Promise ((resolve, reject) => {
			modal.promise = { resolve, reject, type };

			let el = document.querySelector('.modal-prompt'),
				input = document.querySelector('.modal-prompt-input');

			el.children[1].innerText = title;
			el.children[2].innerText = info;

			input.type = type;
			input.value = null;

			modal.open('modal-prompt');
			input.focus();
		});
	},
	promptDone: function () {
		modal.close('modal-prompt');

		let value = document.querySelector('.modal-prompt-input').value;
		modal.promise.resolve(
			(modal.promise.type === 'number' || modal.promise.type === 'range')
			 ? parseFloat(value) : value
		);

		document.querySelector('.modal-prompt-input').value = null;
		modal.promise = { resolve: null, reject: null };
	},

	// type is 'alert' or 'confirm'
	// (determines whether it emulates window.alert or window.confirm)
	confirm: function (title, info, type) {
		return new Promise ((resolve, reject) => {
			modal.promise = { resolve, reject };

			let el = document.querySelector('.modal-confirm');

			el.children[1].innerText = title;
			el.children[2].innerText = info;

			if (type !== 'confirm')
				document.querySelector('.modal-confirm-button').classList.add('hidden');

			modal.open('modal-confirm');
		});
	},
	confirmDone: function (val) {
		modal.close('modal-confirm');
		if (val)
			modal.promise.resolve();
		else
			modal.promise.reject();

		document.querySelector('.modal-confirm-button').classList.remove('hidden');
		modal.promise = { resolve: null, reject: null };
	}
};
