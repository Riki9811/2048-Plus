import Singleton from "./GameManager.js";
import Modal, { disableButtons, enableButtons, setupInfoModal } from "./Modal.js";
import StorageManager from "./utils/localStorageManager.js";

//#region MANAGERS
export const storage = new StorageManager();

console.log({score: storage.previousBestScore, tile: storage.previousBiggestTile});
storage.sizeChangeSubscribe(() => console.log({ score: storage.previousBestScore, tile: storage.previousBiggestTile }));

const manager = Singleton.instance();
manager.setupInput();
//#endregion

//#region REFERENCES
const title = document.getElementById("sub-title");
const infoBtn = document.getElementById("info-btn");
const statsBtn = document.getElementById("stats-btn");
const menuBtn = document.getElementById("menu-btn");
const themeBtn = document.getElementById("theme-btn");
//#endregion

//#region SIZE CHANGE
// Set starting state to subTitle
title.textContent = `${storage.currentSize.w}x${storage.currentSize.h}`;
// Listen to size change and update subTitle
storage.sizeChangeSubscribe((newSize) => (title.textContent = `${newSize.w}x${newSize.h}`));
// Listen to size change and update grid
storage.sizeChangeSubscribe((newSize) => manager.resetGrid(newSize));
//#endregion

//#region DARK MODE TOGGLE
// Set starting state
if (storage.darkMode) document.body.classList.add("darkmode");
// Listen to theme change event
storage.darkModeChangeSubscribe((newDarkMode) => {
	if (newDarkMode) document.body.classList.add("darkmode");
	else document.body.classList.remove("darkmode");
});
// Toggle darkMode on button click
themeBtn.addEventListener("click", () => (storage.darkMode = !document.body.classList.contains("darkmode")));
//#endregion

//#region INFO MODAL
const infoModal = new Modal(document.querySelector("[data-info-modal-template]"), {
	onOpen: (modal) => {
		disableButtons([infoBtn, statsBtn, menuBtn, themeBtn]);
		manager.stopInput();
		setupInfoModal(modal);
	},
	onClose: () => {
		enableButtons([infoBtn, statsBtn, menuBtn, themeBtn]);
		//gameManager.userSettings.showIntro = false
		manager.setupInput();
	},
});
infoBtn.addEventListener("click", () => infoModal.show());
//#endregion

//#region INFO MODAL
const statsModal = new Modal(document.querySelector("[data-stats-modal-template]"), {
	onOpen: (modal) => {
		disableButtons([infoBtn, statsBtn, menuBtn, themeBtn]);
		manager.stopInput();
	},
	onClose: () => {
		enableButtons([infoBtn, statsBtn, menuBtn, themeBtn]);
		manager.setupInput();
	},
});
statsBtn.addEventListener("click", () => statsModal.show());
statsModal.show();
//#endregion
