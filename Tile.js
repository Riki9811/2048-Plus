import { waitForAnimation } from "./utils/animation.js";

export default class Tile {
	#tileElement;
	#x;
	#y;
	#value;

	constructor(tileContainer, value = Math.random() > 0.5 ? 2 : 4) {
		this.#tileElement = document.createElement("div");
		this.#tileElement.classList.add("tile");
		tileContainer.append(this.#tileElement);
		this.value = value;
	}

	set value(v) {
		this.#tileElement.classList.remove(this.#tileClassName);
		this.#value = v;
		this.#tileElement.classList.add(this.#tileClassName);
		this.#tileElement.textContent = v;
	}

	get value() {
		return this.#value;
	}

	set x(value) {
		this.#x = value;
		this.#tileElement.style.setProperty("--x", value);
	}

	set y(value) {
		this.#y = value;
		this.#tileElement.style.setProperty("--y", value);
	}

	remove() {
		this.#tileElement.remove();
	}

	waitForTransition() {
		return waitForAnimation(this.#tileElement);
	}

	get #tileClassName() {
		if (this.#value > 2097152) return "tile-super";
		return `tile-${this.#value}`;
    }
    
    setTransition(on = true) {
        this.#tileElement.style.transition = on ? null : "none";
    }
}
