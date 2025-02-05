// @ts-check

import { loadSlides } from "./slideLoader.js"
import { Slide } from "./slide.js"
import { Router } from "./router.js"

export class Navigator extends HTMLElement {

    constructor() {
        super();
        this._router = new Router();
        this._route = this._router.getRoute();
        this.slidesChangedEvent = new CustomEvent("slideschanged", {
            bubbles: true,
            cancelable: false
        });
        this._router.eventSource.addEventListener("routechanged", () => {
            if (this._route !== this._router.getRoute()) {
                this._route = this._router.getRoute();
                if (this._route) {
                    const slide = parseInt(this._route) - 1;
                    this.jumpTo(slide);
                }
            }
        });
    }

    static get observedAttributes() {
        return ["start"];
    }

    async attributeChangedCallback(attrName, oldVal, newVal) {
        if (attrName === "start") {
            if (oldVal !== newVal) {
                this._slides = await loadSlides(newVal);
                this._route = this._router.getRoute();
                var slide = 0;
                if (this._route) {
                    slide = parseInt(this._route) - 1;
                }
                this.jumpTo(slide);
                this._title = document.querySelectorAll("title")[0];
            }
        }
    }

    get currentIndex() {
        return this._currentIndex;
    }

    get currentSlide() {
        return this._slides ? this._slides[this._currentIndex] : null;
    }

    get totalSlides() {
        return this._slides ? this._slides.length : 0;
    }

    get hasPrevious() {
        return this._currentIndex > 0;
    }

    get hasNext() {
        const host = this.querySelector("div");
        if (host) {
            const appear = host.querySelectorAll(".appear");
            if (appear && appear.length) {
                return true;
            }
        }
        return this._currentIndex < (this.totalSlides - 1);
    }

    jumpTo(slideIdx) {
        if (slideIdx >= 0 && slideIdx < this.totalSlides) {
            this._currentIndex = slideIdx;
            this.innerHTML = '';
            this.appendChild(this.currentSlide.html);
            this._router.setRoute((slideIdx + 1).toString());
            this._route = this._router.getRoute();
            document.title = `${this.currentIndex + 1}/${this.totalSlides}: ${this.currentSlide.title}`;
            this.dispatchEvent(this.slidesChangedEvent);
        }
    }

    checkForAppears() {
        const host = this.querySelector("div");
        const appear = host.querySelectorAll(".appear");
        if (appear.length) {
            appear[0].classList.remove("appear");
            return true;
        }
        return false;
    }

    /**
     * Advance to next slide, if it exists. Applies animation if transition is specified
     */
    next() {
        if (this.checkForAppears()) {
            this.dispatchEvent(this.slidesChangedEvent);
            return;
        }
        if (this.hasNext) {
            this.jumpTo(this.currentIndex + 1);
        }
    }

    /**
     * Move to previous slide, if it exists
     */
    previous() {
        if (this.hasPrevious) {
            this.jumpTo(this.currentIndex - 1);
        }
    }
}

/**
 * Register the custom slide-deck component
 */
export const registerDeck = () => customElements.define('slide-deck', Navigator);