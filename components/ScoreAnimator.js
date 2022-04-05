import { waitForAnimation } from "../utils/animation.js";

export default class ScoreIncreaseAnimation {
    constructor(increaseAmount, parentElement) {
        // Create element
        this.element = document.createElement("div");
        // Add css
        this.element.classList.add("score-increase");
        this.element.classList.add(Math.random() > 0.5 ? "animate-left" : "animate-right");
        // Set content
        this.element.textContent = "+" + increaseAmount
        // Add to dom
        parentElement.append(this.element);
        // Remove from dom after animation
        const boundDelete = this.#delete.bind(this);
        waitForAnimation(this.element).then(boundDelete);
    }

    #delete() {
        this.element.remove();
    }
}