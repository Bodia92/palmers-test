const getActiveLink = () => {
  const liginNavLinks = document.querySelectorAll('.login_nav_list__link');

  if (liginNavLinks.length) {
    const currentUrl = document.location.href;

    liginNavLinks.forEach((link) => {
      if (currentUrl === link.href) {
        link.classList.add('login_nav_list__link--active_page');
      }
    })
  }
}

const fieldsLabelAnim = () => {
  const fieldItems = document.querySelectorAll('.field_item');
  let inputFocus = false;

  if (fieldItems.length) {
    fieldItems.forEach((item) => {
      const $input = item.querySelector('.field_item__input');
      const $label = item.querySelector('.field_item__label');

      if (typeof ($label) !== 'undefined' && $label != null) {
        $input.addEventListener('focus', () => {
          $label.classList.add('field_item__label--transform_mod');
        })
  
        $input.addEventListener('blur', () => {
          if ($input.value === '') {
            $label.classList.remove('field_item__label--transform_mod');
          }
        })
      }
    })
  }
}

const datepickerInit = () => {
  const datepickers = document.querySelectorAll('.datepicker');

  if (datepickers.length) {
    datepickers.forEach((item) => {
      const picker = new easepick.create({
        element: item,
        css: [
          'https://cdn.jsdelivr.net/npm/@easepick/bundle@1.2.0/dist/index.css',
        ],
      });
    })
  }
}

const getStores = () => {
  const $storeSelect = document.querySelector('.storeSelect');

  if (typeof ($storeSelect) !== 'undefined' && $storeSelect != null) {
    const storesApiUrl = $storeSelect.dataset.stores;
    let storesArray = [];

    async function getApi() {
      try {
        const rawResponse = await fetch(storesApiUrl);
        const response = await rawResponse.json();
        storesArray = response.results;
      } catch (e) {
        console.error(e);
      }
    }

    getApi();

    setTimeout(()=> {
      if (storesArray.length) {
        storesArray.forEach((item) => {
          const $storesSelectOption = document.createElement('option');
          $storesSelectOption.value = item.name;
          $storesSelectOption.innerHTML = item.name;
          $storeSelect.appendChild($storesSelectOption);
        })
      }
    }, 1000)
  }
}

window.addEventListener('load', (event) => {
	getActiveLink();
  fieldsLabelAnim();
  datepickerInit();
  getStores();
});