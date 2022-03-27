import Singleton from "./GameManager.js";
import Grid from "./Grid.js";
import { storage } from "./script.js";
import { waitForAnimation, animateElement } from "./utils/animation.js";
import wait from "./utils/wait.js";

export default class Modal {
	constructor(modalContainerTemplate, { onClose = () => {}, onOpen = () => {} } = {}) {
		this.modalContainer = document.createElement("div");
		this.modalContainer.classList.add("modal-backdrop");
		this.modalContainer.append(modalContainerTemplate.content.cloneNode(true));
		this.onClose = onClose;
		this.onOpen = onOpen;

		this.modalContainer.addEventListener("click", (e) => {
			if (e.target === this.modalContainer) this.hide();
		});

		this.closeBtn = this.modalContainer.querySelector("[data-modal-close]");

		this.closeBtn.addEventListener("click", () => {
			this.hide();
		});

		document.addEventListener("keydown", (e) => {
			if (this.isOpen && e.key === "Escape") this.hide();
		});
	}

	get isOpen() {
		return this.modalContainer.classList.contains("show");
	}

	show() {
		document.body.append(this.modalContainer);
		setTimeout(() => {
			this.modalContainer.classList.add("show");
		});
		this.previousFocus = document.activeElement;
		this.closeBtn.focus();
		this.onOpen(this.modalContainer);
	}

	hide() {
		this.modalContainer.classList.remove("show");
		waitForAnimation(this.modalContainer, false).then(() => {
			this.modalContainer.remove();
		});
		(this.previousFocus ?? document.body).focus();
		this.onClose();
	}
}

export async function setupInfoModal(modal) {
	const pressKey = (direction) => {
		arrowKeys.dataset.key = direction;
		animateElement(arrowKeys, "press");
		switch (direction) {
			case "left":
				return instructionGrid.moveLeft(false);
			case "right":
				return instructionGrid.moveRight(false);
			case "up":
				return instructionGrid.moveUp(false);
			case "down":
				return instructionGrid.moveDown(false);
		}
	};

	const performAction = async (x, y, value, direction) => {
		await pressKey(direction);
		instructionGrid.addTileInPosition(x, y, value);
		await wait();
	};

	const instructionBoard = modal.querySelector("#info-board");
	const arrowKeys = modal.querySelector("[data-arrow-keys]");
	const instructionGrid = new Grid(instructionBoard, 3, 3, { cellSize: 7, cellGap: 1 });

	delete arrowKeys.dataset.key;
	arrowKeys.classList.remove("press");
	instructionGrid.addTileInPosition(1, 1, 2);
	await wait();
	await performAction(2, 0, 2, "left");
	await performAction(1, 0, 2, "down");
	await performAction(0, 1, 4, "right");
	await performAction(0, 0, 4, "down");
	await performAction(0, 1, 2, "right");
	await performAction(1, 2, 2, "right");
	await performAction(0, 0, 4, "down");
	await performAction(1, 0, 2, "down");
	await wait();
	setupInfoModal(modal);
}

export async function setupStatsModal(modal, storage, gameManager) {
	const currScoreElem = modal.querySelector("[data-current-score]");
	const currTileElem = modal.querySelector("[data-current-big-tile]");
	const shareBtn = modal.querySelector("#share-btn");
	const shareBtnTooltip = modal.querySelector("#share-btn-tooltip");

	// Set current stats
	currScoreElem.textContent = gameManager.score;
	currTileElem.textContent = gameManager.biggestTileValue;

	// Add class "record" if beating best
	if (gameManager.score > storage.previousBestScore) currScoreElem.parentElement.classList.add("record");
	else currScoreElem.parentElement.classList.remove("record");

	if (gameManager.biggestTileValue > storage.previousBiggestTile) currTileElem.parentElement.classList.add("record");
	else currTileElem.parentElement.classList.remove("record");

	// Set previous stats
	modal.querySelector("[data-best-score]").textContent = storage.previousBestScore;
	modal.querySelector("[data-best-big-tile]").textContent = storage.previousBiggestTile;

	// Share btn click
	let messageTimeOut;
	shareBtn.addEventListener("click", async () => {
		await navigator.clipboard.writeText(makeShareText());
		shareBtn.classList.add("show-tooltip");
		if (messageTimeOut != null) clearTimeout(messageTimeOut);
		messageTimeOut = setTimeout(() => {
			shareBtn.classList.remove("show-tooltip");
		}, 3000);
	});
	shareBtnTooltip.addEventListener("click", (evt) => {
		if (messageTimeOut != null) clearTimeout(messageTimeOut);
		shareBtnTooltip.style.transition = "100ms";
		shareBtn.classList.remove("show-tooltip");
		waitForAnimation(shareBtn).then(() => {
			shareBtnTooltip.style.transitionDuration = null;
		});
		evt.stopPropagation();
	});
}

function makeShareText() {
	const score = numberToEmojis(Singleton.instance().score);
	const bigTileVal = numberToEmojis(Singleton.instance().biggestTileValue);
	const size = storage.currentSize;
	const text = `2048 Plus #${size.w}x${size.h}:\nScore: ${score}\nBiggest tile: ${bigTileVal}\nCan you do better? ${window.location}\n#2048-Plus`;
	return text;
}

function numberToEmojis(number) {
	return number
		.toString()
		.replace(/0/g, "0️⃣")
		.replace(/1/g, "1️⃣")
		.replace(/2/g, "2️⃣")
		.replace(/3/g, "3️⃣")
		.replace(/4/g, "4️⃣")
		.replace(/5/g, "5️⃣")
		.replace(/6/g, "6️⃣")
		.replace(/7/g, "7️⃣")
		.replace(/8/g, "8️⃣")
		.replace(/9/g, "9️⃣");
}

export function disableButtons(btns) {
	for (const btn of btns) btn.disabled = true;
}

export function enableButtons(btns) {
	for (const btn of btns) btn.disabled = false;
}
