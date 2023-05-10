class initStoresList {
  get SELECTORS() {
		return {
			root: '.stores_section__block_stores',
		};
	}

  get CLASSNAMES() {
		return {
			activeState: 'stores_section__block_stores--active_state',
		};
	}

  constructor() {
    this.$root = document.querySelector(this.SELECTORS.root);
    this.apiSrc = this.$root.dataset.stores;
    this.storesArray = [];

    this.init = this.init.bind(this);
		this.init();
  }

  async getApi() {
    try {
      const rawResponse = await fetch(this.apiSrc);
      const response = await rawResponse.json();
      this.storesArray = response.results;
    } catch (e) {
      console.error(e);
    }
  }

  createSroresList() {
    this.getApi();
    const $storesList = document.createElement('div');
		$storesList.className = 'stores_section__list';

    setTimeout(() => {
      if (this.storesArray.length) {
        this.storesArray.map((item) => {
          const phoneNumber = item.phone.replace(/\s+/g, '');
          const hoursLine = item.hours.replace(/(?:\r\n|\r|\n)/g, '<br />');
          const markup = `
            <div class="stores_section__list_item">
              <div class="stores_item">
                <h3 class="stores_item__title">${item.name}</h3>
                <div class="stores_item__address">${item.address}</div>
                <div class="stores_item__work_time">${hoursLine}</div>
                <div class="stores_item__link">
                  <a href="tel:${phoneNumber}" class="stores_item__phone_link">${item.phone}</a>
                </div>
                <div class="stores_item__link">
                  <a href="mailto:${item.email}" class="stores_item__mail_link">${item.email}</a>
                </div>
              </div>
          </div>
        `;
        $storesList.insertAdjacentHTML('beforeend', markup);
        })
        this.$root.appendChild($storesList);
        this.$root.classList.add(this.CLASSNAMES.activeState);
      }
    }, 1000)
  }

  init() {
    if (typeof (this.$root) !== 'undefined' && this.$root != null) {
      this.createSroresList();
    }
  }
}

window.addEventListener('load', (event) => {
	const initStores = new initStoresList();
});