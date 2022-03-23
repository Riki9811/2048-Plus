import Singleton from "./GameManager.js";
import Modal, { setupExampleGrid } from "./Modal.js";

const manager = Singleton.instance();
manager.setupInput();

const infoBtn = document.getElementById("info-btn");
const statsBtn = document.getElementById("stats-btn");
const menuBtn = document.getElementById("menu-btn");
const settingsBtn = document.getElementById("settings-btn");

const infoModal = new Modal(document.querySelector("[data-info-modal-template]"), {
	onOpen: (modal) => {
        infoBtn.disabled = true;
        statsBtn.disabled = true;
        menuBtn.disabled = true;
        settingsBtn.disabled = true;
		manager.stopInput();
        setupExampleGrid(modal);
	},
	onClose: () => {
        infoBtn.disabled = false;
        statsBtn.disabled = false;
        menuBtn.disabled = false;
        settingsBtn.disabled = false;
		//gameManager.userSettings.showIntro = false
		manager.setupInput();
	},
});
infoBtn.addEventListener("click", () => infoModal.show());
infoModal.show();