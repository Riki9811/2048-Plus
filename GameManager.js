import Grid from "./components/Grid.js";
import ScoreIncreaseAnimation from "./components/ScoreAnimator.js";
import InputHandler from "./InputHandler.js";
import { statsModal, storage } from "./script.js";

const THRESHOLD_DISTANCE = 75;
const ALLOWED_GESTURE_TIME = 500;

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
	#mainElement;
	#score;
	#grid;
	#boundHandleInput;
	#resizeWidnowTimeout;

	constructor() {
		this.#scoreCounter = document.getElementById("score-counter");
		this.#mainElement = document.body.querySelector("main");
		this.#boundHandleInput = this.#handleInput.bind(this);
        this.inputHandler = new InputHandler(this.#boundHandleInput, this.#mainElement)
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
		new ScoreIncreaseAnimation(value, this.#scoreCounter);
	}
    endGame() {
        this.stopInput();
        storage.registerStats(this.score, this.#grid.biggestTileValue);
        this.#grid.popAnimation().then(() => {
            statsModal.show();
            storage.readPreviousRecords();
        })
	}
	resetGame() {
		storage.readPreviousRecords();
		this.#resetGrid(storage.currentSize);
		this.#setScore(0);
        this.setupInput();
	}
	//#endregion

	//#region INPUT
    setupInput() {
        this.inputHandler.setupInput();
    }
    stopInput() {
        this.inputHandler.stopInput();
    }
	async #handleInput(direction) {
		switch (direction) {
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
				return;
		}
	}
	//#endregion
}
