import Grid from "./Grid.js";
import { statsModal, storage } from "./script.js";

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
	#gameOver;

	constructor() {
		this.#scoreCounter = document.getElementById("score-counter");
		this.#boundHandleInput = this.#handleInput.bind(this);
        this.resetGame();
	}

	//#region GETTERS
	get score() {
		return this.#score;
	}
	get biggestTileValue() {
		return this.#grid.biggestTileValue;
	}
	//#endregion

	//#region SETTERS
	/**
	 * Sets the gameOver state
	 * @param {boolean} value
	 */
	set gameOver(value) {
		if (value) this.#endGame();
		this.#gameOver = value;
	}
	//#endregion

	//#region GAME-STATE MODIFICATION
	#resetGrid(size) {
		const gameBoard = document.getElementById("game-board");
		this.#grid = new Grid(gameBoard, size.w, size.h);
		window.addEventListener("resize", () => {
			this.#grid.boundSetTileTransitions(false);
			clearTimeout(this.#resizeWidnowTimeout);
			this.#resizeWidnowTimeout = setTimeout(this.#grid.boundSetTileTransitions, 100);
		});
		this.#grid.addTile();
		this.#grid.addTile();
	}
	#setScore(value) {
		this.#score = value;
		this.#scoreCounter.textContent = this.#score;
	}
	addScore(value) {
		this.#score += value;
		this.#scoreCounter.textContent = this.#score;
	}
	#endGame() {
		storage.registerStats(this.score, this.#grid.biggestTileValue);
		statsModal.show();
		storage.readPreviousRecords();
	}
	resetGame() {
		this.#resetGrid(storage.currentSize);
		this.#setScore(0);
		this.#gameOver = false;
	}
	//#endregion

	//#region INPUT
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

		this.setupInput();
	}
	//#endregion
}
