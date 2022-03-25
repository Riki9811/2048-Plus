const DEFAULT_SIZE = { w: 4, h: 4 };
const CURRENT_SIZE_KEY = "currentSize";
const DARK_MODE_KEY = "darkMode";
const STATS_KEY = "stats";

export default class StorageManager {
	/**
	 * Creates an istance of StorageManager. If there currentSize and stats
	 * are not in localStorage saves default values for both.
	 */
    constructor() {
		if (localStorage.getItem(CURRENT_SIZE_KEY) == null) {
			this.#saveValue(CURRENT_SIZE_KEY, DEFAULT_SIZE);
		}
		if (localStorage.getItem(STATS_KEY) == null) {
			let defaultStats = new Map();
			defaultStats.set(sizeToStatKey(this.currentSize), { bestScore: 0, biggestTile: 0 });
			this.#saveValue(STATS_KEY, defaultStats);
		}
	}

	/**
	 * Returns the value associated to key in localStorage.
	 * If key is not found returns defaultValue.
	 * @param {string} key
	 * @param {any} defaultVal [OPTIONAL] Default null
	 * @returns
	 */
	#getValue(key, defaultVal = null) {
		let val = localStorage.getItem(key);
		if (val == null) {
			return defaultVal;
		}
		if (key == STATS_KEY) return new Map(JSON.parse(val));
		return JSON.parse(val);
	}

	/**
	 * Saves the value of key in localStorage
	 * @param {string} key
	 * @param {any} val
	 */
	#saveValue(key, val) {
		let newVal;
		if (key === STATS_KEY) newVal = JSON.stringify(Array.from(val.entries()));
		else newVal = JSON.stringify(val);
		localStorage.setItem(key, newVal);
	}

	/**
	 * Returns the value of currentSize found in localStorage.
	 */
	get currentSize() {
		return this.#getValue(CURRENT_SIZE_KEY);
	}
	/**
	 * Saves the value as currentSize in localStorage.
	 */
	set currentSize(value) {
		this.#saveValue(CURRENT_SIZE_KEY, value);
	}

	/**
	 * Returns the value of darkMode found in localStorage
	 * If the value is not found RETURNS system preferences
	 */
	get darkMode() {
		let systemPref = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
		return this.#getValue(DARK_MODE_KEY, systemPref);
	}
	/**
	 * Saves the value as darkMode in localStorage.
	 */
	set darkMode(value) {
		this.#saveValue(DARK_MODE_KEY, value);
	}

	/**
	 * Returns the value of stats found in localStorage.
	 */
	get stats() {
		return this.#getValue(STATS_KEY);
	}
	/**
	 * Saves the value as stats in localStorage.
	 */
	set stats(value) {
		this.#saveValue(STATS_KEY, value);
	}

	/**
	 * Checks if a key is present in localStorage
	 * @param {string} key Key to check
	 * @returns Boolean
	 */
	#hasKey(key) {
		return localStorage.getItem(key) === null;
	}

	/**
	 * Checks if there is a preference for darkMode in local storage
	 * @returns Boolean
	 */
	hasDarkModePreference() {
		return this.#hasKey(DARK_MODE_KEY);
	}
}

/**
 * Translates the size of the board to a string
 * formatted "WxHstats"
 * @param {{w: number, h: number}} size Size to translate
 * @returns String
 */
function sizeToStatKey(size) {
	return `${size.w}x${size.h}stats`;
}
