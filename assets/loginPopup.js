const loginPopupOpen = () => {
	// console.log('test popup');
	const $body = document.body;
	const $loginPopup = document.querySelector('.loginPopup');
	const loginPopupTriggers = document.querySelectorAll('.loginPopupTrigger');
	let loginPopupOpen = false;

	if (loginPopupTriggers.length) {
		loginPopupTriggers.forEach((item) => {
			// console.log(item);
			item.addEventListener('click', () => {
				if (!loginPopupOpen) {
					$body.classList.add('body--popup_open_state');
                    $loginPopup.classList.remove('popup_hidden')
					loginPopupOpen = true;
					//console.log(loginPopupOpen);
				} else {
					$body.classList.remove('body--popup_open_state');
                    $loginPopup.classList.add('popup_hidden')
					loginPopupOpen = false;
					//console.log(loginPopupOpen);
				}
			});
		});
	}
};

window.addEventListener('load', (event) => {
	const $loginPopup = document.querySelector('.loginPopup');

	if (typeof $loginPopup !== 'undefined' && $loginPopup != null) {
		loginPopupOpen();
	}
});
