const DEFAULT_SIZE = { w: 4, h: 4 };
const CURRENT_SIZE_KEY = "currentSize";
const DARK_MODE_KEY = "darkMode";
const STATS_KEY = "stats";
const IS_FIRST_TIME = "isFirstTime";

export default class StorageManager {
	#sizeChangeCallbacks;
	#darkModeChangeCallbacks;
	#statsChangeCallbacks;
	#previusBestScore;
    #previousBiggestTile;
    #isFirstTime = false;

	/**
	 * Creates an istance of StorageManager. If there currentSize and stats
	 * are not in localStorage saves default values for both.
	 */
	constructor() {
		this.#sizeChangeCallbacks = [];
		this.#darkModeChangeCallbacks = [];
        this.#statsChangeCallbacks = [];
        
        // Se è la prima volta che si apre il gioco
        if (!this.#hasKey(IS_FIRST_TIME) || localStorage.getItem(IS_FIRST_TIME) === 'true') {
            // Imposta a false la preferenza per la prima volta
            localStorage.setItem(IS_FIRST_TIME, 'false');
            // Ricorda che devi mostrare le info
			this.#isFirstTime = true;
		}

		if (localStorage.getItem(CURRENT_SIZE_KEY) == null) {
			this.currentSize = DEFAULT_SIZE;
		} else {
			this.readPreviousRecords(this.currentSize);
		}

		if (localStorage.getItem(STATS_KEY) == null) {
			let defaultStats = new Map();
			defaultStats.set(sizeToStatKey(this.currentSize), { bestScore: 0, biggestTile: 0 });
			this.#stats = defaultStats;
		}
	}

	//#region GENERAL GETTER AND SETTER
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
	//#endregion

	//#region CURRENT SIZE
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
        if (!value.w) value.w = 4;
        if (!value.h) value.h = 4;
		this.#saveValue(CURRENT_SIZE_KEY, value);
		this.readPreviousRecords(value);
		this.#triggerSizeChange(value);
	}
	//#endregion

	//#region DARK MODE
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
		this.#triggerDarkModeChange(value);
	}
	//#endregion

	//#region STATS
	/**
	 * Returns the value of stats found in localStorage.
	 * @returns {Map<string, {bestScore, biggestTile}}
	 */
	get stats() {
		return this.#getValue(STATS_KEY);
	}
	/**
	 * Saves the value as stats in localStorage.
	 */
	set #stats(value) {
		this.#saveValue(STATS_KEY, value);
		this.#triggerStatsChange(value);
	}
	/**
	 * Register the stats of bestScore and biggestTile for currentSize
	 * @param {number} bestScore Score to register
	 * @param {number} biggestTile Size of tile to register
	 */
	registerStats(bestScore, biggestTile) {
		const sizeKey = sizeToStatKey(this.currentSize);
		var newStats = this.stats;
		if (newStats.has(sizeKey)) {
			var { bestScore: newScore, biggestTile: newBigTile } = newStats.get(sizeKey);
			if (newScore < bestScore) newScore = bestScore;
			if (newBigTile < biggestTile) newBigTile = biggestTile;
			newStats.set(sizeKey, { bestScore: newScore, biggestTile: newBigTile });
		} else {
			newStats.set(sizeKey, { bestScore, biggestTile });
		}
		this.#stats = newStats;
	}
	//#endregion

	//#region PREVIOUS RECORD
	readPreviousRecords(value) {
		const sizeStats = this.stats?.get(sizeToStatKey(value ? value : this.currentSize));
		this.#previusBestScore = sizeStats?.bestScore | 0;
		this.#previousBiggestTile = sizeStats?.biggestTile | 0;
	}

	get previousBestScore() {
		return this.#previusBestScore;
	}

	get previousBiggestTile() {
		return this.#previousBiggestTile;
	}
	//#endregion

    //#region FIRST TIME PLAYING
    get isFirstTime() {
        return this.#isFirstTime;
    }
    //#endregion

	//#region LOCALSTORAGE KEY PRESENCE
	/**
	 * Checks if a key is present in localStorage
	 * @param {string} key Key to check
	 * @returns Boolean
	 */
	#hasKey(key) {
		return localStorage.getItem(key) !== null;
	}
	/**
	 * Checks if there is a preference for darkMode in local storage
	 * @returns Boolean
	 */
	hasDarkModePreference() {
		return this.#hasKey(DARK_MODE_KEY);
	}
	//#endregion

	//#region EVENT SUBSCRIBERS
	/**
	 * Subscribes the function passed in input to the currentSize change event
	 * @param {function} func Callback
	 */
	sizeChangeSubscribe(func) {
		this.#sizeChangeCallbacks.push(func);
	}

	/**
	 * Subscribes the function passed in input to the darkMode change event
	 * @param {function} func Callback
	 */
	darkModeChangeSubscribe(func) {
		this.#darkModeChangeCallbacks.push(func);
	}

	/**
	 * Subscribes the function passed in input to the stats change event
	 * @param {function} func Callback
	 */
	statsChangeSubscribe(func) {
		this.#statsChangeCallbacks.push(func);
	}
	//#endregion

	//#region EVENT TRIGGERS
	/**
	 * Triggers the sizeChange event and calls all subscribed callbacks
	 * @param {{w: number, h: number}} newSize The new size
	 */
	#triggerSizeChange(newSize) {
		for (const callback of this.#sizeChangeCallbacks) callback(newSize);
	}

	/**
	 * Triggers the darkModeChange event and calls all subscribed callbacks
	 * @param {boolean} newDarkMode The new darkMode
	 */
	#triggerDarkModeChange(newDarkMode) {
		for (const callback of this.#darkModeChangeCallbacks) callback(newDarkMode);
	}

	/**
	 * Triggers the statsChange event and calls all subscribed callbacks
	 * @param {Map<string, {bestScore:number, biggestTile:number}} newStats The new stats
	 */
	#triggerStatsChange(newStats) {
		for (const callback of this.#statsChangeCallbacks) callback(newStats);
	}
	//#endregion
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
