export default class Select {
	constructor(element, { onSelect = (value) => {} } = {}) {
        this.selectElement = element;
        this.#setupStartingOptions()
		this.onSelect = onSelect;

        this.selectElement.addEventListener("click", () => {
            this.toggleOpen();
		});

		document.addEventListener("click", (e) => {
			this.hide();
		});
	}

    #setupStartingOptions() {
        this.placeholder = this.selectElement.querySelector("p[data-select-default]");
        this.optionsContainer = this.selectElement.querySelector("[data-select-options-container]");
        this.optionsContainer.remove();
    }

	get isOpen() {
		return this.selectElement.classList.contains("open");
	}

    toggleOpen() {
        if (this.isOpen) this.hide();
        else this.open();
    }

    open() {
        this.selectElement.classList.add("open");
        this.selectElement.append(this.optionsContainer);
	}

	hide() {
        this.selectElement.classList.remove("open");
	}
}
