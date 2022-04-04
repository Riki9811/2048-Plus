import Singleton from "./GameManager.js";
import Modal, { disableButtons, enableButtons, setupCustomSizeModal, setupInfoModal, setupStatsModal } from "./Modal.js";
import { waitForAnimation } from "./utils/animation.js";
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
const resetBtn = document.getElementById("reset-btn");
const menuBtn = document.getElementById("menu-btn");
const themeBtn = document.getElementById("theme-btn");
const sizeBtns = [...document.getElementsByClassName("size-btn")];
//#endregion

//#region SIZE CHANGE
// Set starting state to subTitle
title.textContent = `${storage.currentSize.w}x${storage.currentSize.h}`;
// Set starting sizeButtons disabled
updateSizeButtons(storage.currentSize);
// Listen to size change and update subTitle
storage.sizeChangeSubscribe((newSize) => (title.textContent = `${newSize.w}x${newSize.h}`));
// Listen to size change and update grid
storage.sizeChangeSubscribe(() => manager.resetGame());
// Listen to size change and update size buttons
storage.sizeChangeSubscribe((newSize) => updateSizeButtons(newSize));
//#endregion

//#region DARK MODE TOGGLE
// Set starting state (without animating)
if (storage.darkMode) {
	const themeBtnChildren = themeBtn.children;
	for (const child of themeBtnChildren) child.style.transitionDuration = "0s";
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
// Se è la prima volta che gioca mostra la modale di info
if (storage.isFirstTime) infoModal.show();
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

//#region CUSTOM SIZE MODAL
const customSizeModal = new Modal(document.querySelector("[data-custom-size-modal-template]"), {
	onOpen: (modal) => {
		disableButtons([infoBtn, statsBtn, menuBtn, themeBtn]);
		manager.stopInput();
		setupCustomSizeModal(modal, closeSizeModal);
	},
	onClose: () => {
		enableButtons([infoBtn, statsBtn, menuBtn, themeBtn]);
		manager.setupInput();
	},
});
const closeSizeModal = () => customSizeModal.hide();
//#endregion

//#region MENU
// Disable all buttons by default (this is because the menu is not visible by default)
disableButtons(sizeBtns);
// Function to toggle the side menu
function toggleMenu() {
	menu.classList.toggle("show");

	const onMenuOpen = () => {
		manager.stopInput();
		menuBtn.classList.add("to-cross");
		menuBtn.style.zIndex = "100";
		updateSizeButtons(storage.currentSize);
		disableButtons([infoBtn, statsBtn, themeBtn]);
	};

	const onMenuClose = () => {
		menuBtn.style.zIndex = null;
		manager.setupInput();
		enableButtons([infoBtn, statsBtn, themeBtn]);
	};

	if (menu.classList.contains("show")) {
		onMenuOpen();
	} else {
		menuBtn.classList.remove("to-cross");
		disableButtons(sizeBtns);
		waitForAnimation(menu, false).then(onMenuClose);
	}
}
// Set sizeButton with dataSet to size as disabled, all other as enabled
function updateSizeButtons(size) {
    sizeBtns.forEach((btn) => {
        const sizeInt = parseInt(btn.dataset.size);
        btn.disabled = false;

		if (sizeInt === size.w && sizeInt === size.h) {
			btn.classList.add("selected");
		} else if (btn.dataset.size === "Custom" && size.w !== size.h) {
			btn.classList.add("selected");
		} else {
			btn.classList.remove("selected");
		}
	});
}
// Sets the bame size based on button dataSet
function setGameSize(button) {
    // If button has class selected and doues not have "Custom" as size data don't do anything
    if (button.classList.contains("selected") && button.dataset.size !== "Custom") return;
    
    const size = button.dataset.size || "4";
	const sizeInt = parseInt(size);
	// If size is not "custom" set else close menu and ask custom size with modal
	if (!isNaN(sizeInt)) storage.currentSize = { w: sizeInt, h: sizeInt };
    else {
        toggleMenu();
        customSizeModal.show();
	}
}
menuBtn.addEventListener("click", toggleMenu);
sizeBtns.forEach((btn) => btn.addEventListener("click", () => setGameSize(btn)));
//#endregion

//#region RESET
resetBtn.addEventListener("click", resetGame, { once: true });
// Call reset game function (animates btn also)
function resetGame() {
	resetBtn.classList.add("reset-btn-spin");
	manager.resetGame();
	waitForAnimation(resetBtn).then(() => {
		resetBtn.classList.remove("reset-btn-spin");
		resetBtn.addEventListener("click", resetGame, { once: true });
	});
}
//#endregion
