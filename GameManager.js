import Grid from "./Grid.js";
import { storage } from "./script.js";

var Singleton = (function () {
	var instance;

	function createInstance() {
		return new GameManager();
	}

	return {
		instance: function () {
			if (!instance) {
				instance = createInstance();
			}
			return instance;
		},
	};
})();

export default Singleton;

class GameManager {
	#scoreCounter;
	#score;
	#grid;
	#boundHandleInput;
	#resizeWidnowTimeout;

	constructor() {
		this.#score = 0;
		this.#scoreCounter = document.getElementById("score-counter");
		this.#boundHandleInput = this.#handleInput.bind(this);
		this.resetGrid();
	}

	resetGrid() {
		const gameBoard = document.getElementById("game-board");
		const size = storage.currentSize;
		this.#grid = new Grid(gameBoard, size.w, size.h);
		window.addEventListener("resize", () => {
			this.#grid.boundSetTileTransitions(false);
			clearTimeout(this.#resizeWidnowTimeout);
			this.#resizeWidnowTimeout = setTimeout(this.#grid.boundSetTileTransitions, 100);
		});
		this.#grid.addTile();
		this.#grid.addTile();
	}

	get score() {
		return this.#score;
	}

	addScore(value) {
		this.#score += value;
		this.#scoreCounter.textContent = this.#score;
	}

	setupInput() {
		window.addEventListener("keydown", this.#boundHandleInput, { once: true });
	}

	stopInput() {
		window.removeEventListener("keydown", this.#boundHandleInput);
	}

	async #handleInput(e) {
		switch (e.key) {
			case "ArrowUp":
				if (!this.#grid.canMoveUp()) {
					this.setupInput();
					return;
				}
				await this.#grid.moveUp();
				break;
			case "ArrowDown":
				if (!this.#grid.canMoveDown()) {
					this.setupInput();
					return;
				}
				await this.#grid.moveDown();
				break;
			case "ArrowLeft":
				if (!this.#grid.canMoveLeft()) {
					this.setupInput();
					return;
				}
				await this.#grid.moveLeft();
				break;
			case "ArrowRight":
				if (!this.#grid.canMoveRight()) {
					this.setupInput();
					return;
				}
				await this.#grid.moveRight();
				break;
			default:
				this.setupInput();
				return;
		}

		console.log("Move done?");
		this.setupInput();
	}
}
