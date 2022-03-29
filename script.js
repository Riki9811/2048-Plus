import Singleton from "./GameManager.js";
import Modal, { disableButtons, enableButtons, setupInfoModal, setupStatsModal } from "./Modal.js";
import StorageManager from "./utils/localStorageManager.js";

//#region MANAGERS
export const storage = new StorageManager();

const manager = Singleton.instance();
manager.setupInput();
//#endregion

//#region REFERENCES
const title = document.getElementById("sub-title");
const menu = document.getElementById("menu");

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
storage.sizeChangeSubscribe(() => manager.resetGame());
//#endregion

//#region DARK MODE TOGGLE
// Set starting state (without animating)
if (storage.darkMode) {
    const themeBtnChildren = themeBtn.children;
    for (const child of themeBtnChildren) child.style.transitionDuration = "0s"
    document.body.classList.add("darkmode");
    setTimeout(() => {
    for (const child of themeBtnChildren) child.style.transitionDuration = null;
	}, 1);
}
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

//#region STATS MODAL
export const statsModal = new Modal(document.querySelector("[data-stats-modal-template]"), {
	onOpen: (modal) => {
		disableButtons([infoBtn, statsBtn, menuBtn, themeBtn]);
		manager.stopInput();
        setupStatsModal(modal, storage, manager);
	},
	onClose: () => {
		enableButtons([infoBtn, statsBtn, menuBtn, themeBtn]);
		manager.setupInput();
	},
});
statsBtn.addEventListener("click", () => statsModal.show());
//#endregion

//#region MENU MODAL
menuBtn.addEventListener("click", () => {
    if (menu.classList.contains("show")) {
        menu.classList.remove("show");
        document.body.classList.remove("menu-margin-left");
    } else {
        menu.classList.add("show");
        document.body.classList.add("menu-margin-left");
    }
});
//#endregion
