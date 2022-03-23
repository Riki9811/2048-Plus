import Grid from "./Grid.js";

var Singleton = (function () {
	var instance;

	function createInstance() {
		const scoreCounter = document.getElementById("score-counter");
		const gameBoard = document.getElementById("game-board");
		return new GameManager(scoreCounter, gameBoard);
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

	constructor(scoreCounter, gameBoard) {
		this.#score = 0;
		this.#scoreCounter = scoreCounter;
		this.#boundHandleInput = this.#handleInput.bind(this);
		this.#grid = new Grid(gameBoard);
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

		this.setupInput();
	}
}
