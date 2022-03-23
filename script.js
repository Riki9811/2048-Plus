import Singleton from "./GameManager.js";
import Modal, { setupInfoModal } from "./Modal.js";

const manager = Singleton.instance();
manager.setupInput();

const infoBtn = document.getElementById("info-btn");
const statsBtn = document.getElementById("stats-btn");
const menuBtn = document.getElementById("menu-btn");
const themeBtn = document.getElementById("theme-btn");

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
