import Singleton from "./GameManager.js";
import Modal, { setupInfoModal } from "./Modal.js";
import StorageManager from "./utils/localStorageManager.js";

//#region MANAGERS
export const storage = new StorageManager();
if (storage.darkMode) document.body.classList.add("darkmode");

const manager = Singleton.instance();
manager.setupInput();
//#endregion

//#region REFERENCES
const title = document.getElementById("title");
const infoBtn = document.getElementById("info-btn");
const statsBtn = document.getElementById("stats-btn");
const menuBtn = document.getElementById("menu-btn");
const themeBtn = document.getElementById("theme-btn");
//#endregion

//#region TITLE CHANGE
//#endregion

//#region INFO
const infoModal = new Modal(document.querySelector("[data-info-modal-template]"), {
	onOpen: (modal) => {
		infoBtn.disabled = true;
		statsBtn.disabled = true;
		menuBtn.disabled = true;
		themeBtn.disabled = true;
		manager.stopInput();
		setupInfoModal(modal);
	},
	onClose: () => {
		infoBtn.disabled = false;
		statsBtn.disabled = false;
		menuBtn.disabled = false;
		themeBtn.disabled = false;
		//gameManager.userSettings.showIntro = false
		manager.setupInput();
	},
});
infoBtn.addEventListener("click", () => infoModal.show());
//#endregion

//#region THEME
themeBtn.addEventListener("click", toggleDarkMode);

function toggleDarkMode() {
	document.body.classList.toggle("darkmode");
	storage.darkMode = document.body.classList.contains("darkmode");
}
//#endregion