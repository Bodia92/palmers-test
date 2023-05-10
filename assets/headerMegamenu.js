const headerMegamenu = (root) => {
	// console.log('headerMegamenu');

	let openMegamenu = false;

	const megamenuListItems = root.querySelectorAll('.megamenuListItem');
	const megamenuDropdownItems = root.querySelectorAll('.megamenuDropdownItem');

	if (typeof megamenuListItems !== 'undefined' && megamenuListItems.length) {
		megamenuListItems.forEach((item, index) => {
			const $sideNavDropdown = item.querySelector('.side_nav_dropdown');
			const dropDownParrent = $sideNavDropdown ? true : false;

			// console.log(dropDownParrent);

			item.addEventListener('click', (e) => {
				// console.log(item);
				if (!openMegamenu) {
					if (
						!item.classList.contains(
							'header_megamenu_list__item_in--active_state',
						)
					) {
						item.classList.add('header_megamenu_list__item_in--active_state');
						if (!dropDownParrent) {
							megamenuDropdownItems[index].classList.add(
								'megamenu_dropdown_item--open_state',
							);
						}
					}
					openMegamenu = true;
				} else {
					if (openMegamenu) {
						if (
							!item.classList.contains(
								'header_megamenu_list__item_in--active_state',
							)
						) {
							document
								.querySelector('.header_megamenu_list__item_in--active_state')
								.classList.remove(
									'header_megamenu_list__item_in--active_state',
								);
							if (
								typeof document.querySelector(
									'.megamenu_dropdown_item--open_state',
								) !== 'undefined' &&
								document.querySelector('.megamenu_dropdown_item--open_state') !=
									null
							) {
								document
									.querySelector('.megamenu_dropdown_item--open_state')
									.classList.remove('megamenu_dropdown_item--open_state');
							}
							item.classList.add('header_megamenu_list__item_in--active_state');
							if (!dropDownParrent) {
								megamenuDropdownItems[index].classList.add(
									'megamenu_dropdown_item--open_state',
								);
							}
						} else {
							document
								.querySelector('.header_megamenu_list__item_in--active_state')
								.classList.remove(
									'header_megamenu_list__item_in--active_state',
								);

							if (
								typeof document.querySelector(
									'.megamenu_dropdown_item--open_state',
								) !== 'undefined' &&
								document.querySelector('.megamenu_dropdown_item--open_state') !=
									null
							) {
								document
									.querySelector('.megamenu_dropdown_item--open_state')
									.classList.remove('megamenu_dropdown_item--open_state');
							}
							openMegamenu = false;
						}
					}
				}
			});
		});
	}
};

window.addEventListener('load', (event) => {
	const $headerMegamenu = document.querySelector('.headerMegamenu');

	if (typeof $headerMegamenu !== 'undefined' && $headerMegamenu != null) {
		headerMegamenu($headerMegamenu);
	}
});
