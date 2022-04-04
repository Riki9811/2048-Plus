import Cell from "./Cell.js";
import Singleton from "./GameManager.js";
import { storage } from "./script.js";
import Tile from "./Tile.js";

export default class Grid {
	#gridElement;
	#cells;
	#w;
	#h;
	#biggestTile;
	#gameOverScreen;

	constructor(gridElemet, w, h, { cellSize = 70 / Math.max(w, h), cellGap } = {}) {
		this.#w = w;
		this.#h = h;
		this.#gridElement = gridElemet;
		this.#biggestTile = -1;

		gridElemet.innerHTML = "";
		gridElemet.style.setProperty("--grid-w", this.#w);
		gridElemet.style.setProperty("--grid-h", this.#h);
		gridElemet.style.setProperty("--cell-size", `calc(${cellSize}vmin - 1rem)`);
		gridElemet.style.setProperty("--cell-gap", cellGap ? `${cellGap}vmin` : `calc(var(--cell-size) / 10)`);
		this.#cells = createCellElements(gridElemet, w, h).map((cellElement, index) => {
			return new Cell(cellElement, index % this.#w, Math.floor(index / this.#w));
		});
		this.boundSetTileTransitions = this.#setTileTransitions.bind(this);
	}

	//#region CELLS GETTERS
	get cells() {
		return this.#cells;
	}
	get cellsByColumns() {
		return this.#cells.reduce((cellGrid, cell) => {
			cellGrid[cell.x] = cellGrid[cell.x] || [];
			cellGrid[cell.x][cell.y] = cell;
			return cellGrid;
		}, []);
	}
	get cellsByRows() {
		return this.#cells.reduce((cellGrid, cell) => {
			cellGrid[cell.y] = cellGrid[cell.y] || [];
			cellGrid[cell.y][cell.x] = cell;
			return cellGrid;
		}, []);
	}
	get #emptyCells() {
		return this.#cells.filter((cell) => cell.tile === null || cell.tile === undefined);
	}
	randomEmptyCell() {
		const randIndex = Math.floor(Math.random() * this.#emptyCells.length);
		return this.#emptyCells[randIndex];
	}
	//#endregion

	//#region BIGGEST TILE
	get biggestTileValue() {
		return this.#biggestTile;
	}
	checkBiggestTileValue(value) {
		if (this.#biggestTile < value) {
			this.#biggestTile = value;
		}
	}
	//#endregion

	//#region MOVE METHODS
	async moveUp(addTile = true) {
		await this.#slideTiles(this.cellsByColumns);
		this.#finalizeMove(addTile);
	}
	async moveDown(addTile = true) {
		await this.#slideTiles(this.cellsByColumns.map((column) => [...column].reverse()));
		this.#finalizeMove(addTile);
	}
	async moveLeft(addTile = true) {
		await this.#slideTiles(this.cellsByRows);
		this.#finalizeMove(addTile);
	}
	async moveRight(addTile = true) {
		await this.#slideTiles(this.cellsByRows.map((row) => [...row].reverse()));
		this.#finalizeMove(addTile);
	}
	async #slideTiles(cells) {
		return Promise.all(
			cells.flatMap((group) => {
				const promises = [];
				for (let i = 1; i < group.length; i++) {
					const cell = group[i];
					if (cell.tile == null) continue;
					let lastValidCell;
					for (let j = i - 1; j >= 0; j--) {
						const moveToCell = group[j];
						if (!moveToCell.canAccept(cell.tile)) break;
						lastValidCell = moveToCell;
					}
					if (lastValidCell != null) {
						promises.push(cell.tile.waitForTransition());
						if (lastValidCell.tile != null) lastValidCell.mergeTile = cell.tile;
						else lastValidCell.tile = cell.tile;
						cell.tile = null;
					}
				}
				return promises;
			})
		);
	}
	#finalizeMove(addTile) {
		this.#cells.forEach((cell) => {
			if (cell.doMerge(addTile)) this.checkBiggestTileValue(cell.tile.value);
		});

		if (addTile) {
			const newTile = this.addTile();

			if (!this.canMoveUp() && !this.canMoveDown() && !this.canMoveLeft() && !this.canMoveRight()) {
				newTile.waitForTransition().then(() => {
					Singleton.instance().endGame();
				});
				return;
			}
		}

		storage.registerStats(Singleton.instance().score, this.#biggestTile);
	}
	//#endregion

	//#region CHECK MOVE POSSIBILITY
	canMoveUp() {
		return this.#canMove(this.cellsByColumns);
	}
	canMoveDown() {
		return this.#canMove(this.cellsByColumns.map((column) => [...column].reverse()));
	}
	canMoveLeft() {
		return this.#canMove(this.cellsByRows);
	}
	canMoveRight() {
		return this.#canMove(this.cellsByRows.map((row) => [...row].reverse()));
	}
	#canMove(cells) {
		return cells.some((group) => {
			return group.some((cell, index) => {
				if (index === 0 || cell.tile == null) return false;
				const moveToCell = group[index - 1];
				return moveToCell.canAccept(cell.tile);
			});
		});
	}
	//#endregion

	//#region MODIFY TILES
	addTile(val) {
		const newTile = new Tile(this.#gridElement, val);
		this.randomEmptyCell().tile = newTile;
		this.checkBiggestTileValue(newTile.value);
		return newTile;
	}
	addTileInPosition(x, y, val) {
		const index = y * this.#w + x;
		if (this.#cells[index].tile == null) {
			const newTile = new Tile(this.#gridElement, val);
			this.#cells[index].tile = newTile;
			this.checkBiggestTileValue(newTile.value);
			return newTile;
		}
		return undefined;
	}
	#setTileTransitions(on = true) {
		for (const cell of this.cells) {
			if (!cell.tile) continue;
			cell.tile.setTransition(on);
		}
	}
	//#endregion
}

function createCellElements(gridElement, w, h) {
	const cells = [];
	for (let i = 0; i < w * h; i++) {
		const cell = document.createElement("div");
		cell.classList.add("cell");
		cells.push(cell);
		gridElement.append(cell);
	}
	return cells;
}
