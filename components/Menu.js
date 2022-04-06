import { storage } from "../script.js";
import { waitForAnimation } from "../utils/animation.js";
import { disableButtons } from "./Modal.js";

export default class Menu {
	constructor(menuBtn, setGameSize, { onClose = () => {}, onOpen = () => {} } = {}) {
		this.menuElement = document.getElementById("menu");
		this.sizeButtons = [...this.menuElement.querySelectorAll("[data-size]")];
		this.menuBtn = menuBtn;
		this.onClose = onClose;
		this.onOpen = onOpen;

		disableButtons(this.sizeButtons);

		this.toggle = this.#unboundToggle.bind(this);

		this.sizeButtons.forEach((btn) => btn.addEventListener("click", () => setGameSize(btn)));

		document.addEventListener("keydown", (e) => {
			if (this.isOpen && e.key === "Escape") this.hide();
		});

        const boundEnableButtons = this.#enableButtons.bind(this);
		storage.sizeChangeSubscribe(boundEnableButtons);
	}

	get isOpen() {
		return this.menuElement.classList.contains("show");
	}

	#unboundToggle() {
		if (this.isOpen) this.hide();
		else this.show();
	}

	show() {
		// Show menu
		this.menuElement.classList.add("show");
		// Turn btn to cross (+ make it visible)
		this.menuBtn.classList.add("to-cross");
		this.menuBtn.style.zIndex = "100";
		// Enable the buttons and set correct one to selected
		this.#enableButtons();
		// Trigger onOpen callback
		this.onOpen();
	}

	hide() {
		// Hide menu
		this.menuElement.classList.remove("show");
		// Turn btn to hamburger menu
		this.menuBtn.classList.remove("to-cross");
		// Disable the size buttons
        disableButtons(this.sizeButtons);
		// After the closing animation is done call onClose and reset btn z-index
		waitForAnimation(this.menuElement, false).then(() => {
			this.menuBtn.style.zIndex = null;
			this.onClose();
		});
	}

	// Set enable all buttons and set correct one as selected
	#enableButtons() {
		const size = storage.currentSize;
		this.sizeButtons.forEach((btn) => {
			const sizeInt = parseInt(btn.dataset.size);
			btn.disabled = false;

			if (sizeInt === size.w && sizeInt === size.h) {
				btn.classList.add("selected");
			} else if (btn.dataset.size === "Custom" && size.w !== size.h) {
				btn.classList.add("selected");
			} else {
				btn.classList.remove("selected");
			}
		});
	}
}
