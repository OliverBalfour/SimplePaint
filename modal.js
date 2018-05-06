
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
			this.promise = { resolve, reject };
			document.querySelector('.modal-image-upload').children[1].innerText = title;
			document.querySelector('.modal-image-upload').children[2].innerText = info;
			this.open('modal-image-upload');
		});
	},
	imageDone: function () {
		if (document.querySelector('.image-upload-input').files.length) {
			let reader = new FileReader();
			reader.readAsDataURL(document.querySelector('.image-upload-input').files[0]);
			reader.addEventListener('load', () => {
				modal.close('modal-image-upload');
				this.promise.resolve(reader.result);
				this.promise = { resolve: null, reject: null };
			});
		}
	},

	// type is a valid type for input elements
	prompt: function (title, info, type) {
		return new Promise ((resolve, reject) => {
			this.promise = { resolve, reject };

			let modal = document.querySelector('.modal-prompt'),
				input = document.querySelector('.modal-prompt-input');

			modal.children[1].innerText = title;
			modal.children[2].innerText = info;

			input.type = type;
			input.value = null;

			this.open('modal-prompt');
			input.focus();
		});
	},
	promptDone: function () {
		this.close('modal-prompt');
		this.promise.resolve(document.querySelector('.modal-prompt-input').value);
		document.querySelector('.modal-prompt-input').value = null;
		this.promise = { resolve: null, reject: null };
	},

	// type is 'alert' or 'confirm'
	// (determines whether it emulates window.alert or window.confirm)
	confirm: function (title, info, type) {
		return new Promise ((resolve, reject) => {
			this.promise = { resolve, reject };

			let modal = document.querySelector('.modal-confirm');

			modal.children[1].innerText = title;
			modal.children[2].innerText = info;

			if (type !== 'confirm')
				document.querySelector('.modal-confirm-button').classList.add('hidden');

			this.open('modal-confirm');
		});
	},
	confirmDone: function (val) {
		this.close('modal-confirm');
		if (val)
			this.promise.resolve();
		else
			this.promise.reject();

		document.querySelector('.modal-confirm-button').classList.remove('hidden');
		this.promise = { resolve: null, reject: null };
	}
};
