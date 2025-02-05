import { Navigator } from "./navigator.js"

export class Controls extends HTMLElement {

    constructor() {
        super();
        this._controlRef = null;
        this._deck = null;
    }

    /**
     * Called when the element is inserted into the DOM. Used to fetch the template and wire into the related Navigator instance.
     */
    async connectedCallback() {
        const response = await fetch("./templates/controls.html");
        const template = await response.text();
        this.innerHTML = "";
        const host = document.createElement("div");
        host.innerHTML = template;
        this.appendChild(host);
        this._controlRef = {
            first: (document.getElementById("ctrlFirst")),
            prev: (document.getElementById("ctrlPrevious")),
            next: (document.getElementById("ctrlNext")),
            last: (document.getElementById("ctrlLast")),
            pos: (document.getElementById("position"))
        };
        this._controlRef.first.addEventListener("click", () => this._deck.jumpTo(0));
        this._controlRef.prev.addEventListener("click", () => this._deck.previous());
        this._controlRef.next.addEventListener("click", () => this._deck.next());
        this._controlRef.last.addEventListener("click", () => this._deck.jumpTo(this._deck.totalSlides - 1));
        this.refreshState();
    }

    static get observedAttributes() {
        return ["deck"];
    }

    async attributeChangedCallback(attrName, oldVal, newVal) {
        if (attrName === "deck") {
            if (oldVal !== newVal) {
                this._deck = (document.getElementById(newVal));
                this._deck.addEventListener("slideschanged", () => this.refreshState());
            }
        }
    }

    /**
     * Enables/disables buttons and updates position based on index in the deck
     */
    refreshState() {
        if (this._controlRef == null) {
            return;
        }
        const next = this._deck.hasNext;
        const prev = this._deck.hasPrevious;
        this._controlRef.first.disabled = !prev;
        this._controlRef.prev.disabled = !prev;
        this._controlRef.next.disabled = !next;
        this._controlRef.last.disabled = this._deck.currentIndex === (this._deck.totalSlides - 1);
        this._controlRef.pos.innerText = `${this._deck.currentIndex + 1} / ${this._deck.totalSlides}`;
    }
}

/** Register the custom slide-controls element */
export const registerControls = () => customElements.define('slide-controls', Controls);