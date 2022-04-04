import Singleton from "./GameManager.js";

export default class Cell {
	#cellElement;
	#x;
	#y;
	#tile;
	#mergeTile;

	constructor(cellElement, x, y) {
		this.#cellElement = cellElement;
		this.#x = x;
		this.#y = y;
	}

	get x() {
		return this.#x;
	}

	get y() {
		return this.#y;
	}

	get tile() {
		return this.#tile;
	}

	get mergeTile() {
		return this.#mergeTile;
	}

	set mergeTile(value) {
		this.#mergeTile = value;
		if (value == null) return;
		this.#mergeTile.x = this.#x;
		this.#mergeTile.y = this.#y;
	}

	set tile(value) {
		this.#tile = value;
		if (value == null) return;
		this.#tile.x = this.#x;
		this.#tile.y = this.#y;
	}

	canAccept(tile) {
		return this.tile == null || (this.mergeTile == null && this.tile.value === tile.value);
	}

    /**
     * Merges the tiles into 1 with double amount (also adds to the score)
     * @returns Whether the merge was successful
     */
	doMerge(addScore = true) {
		if (this.tile == null || this.mergeTile == null) return false;
		this.tile.value = this.tile.value + this.mergeTile.value;
		if (addScore) Singleton.instance().addScore(this.tile.value);
		this.mergeTile.remove();
        this.mergeTile = null;
        return true;
	}
}
