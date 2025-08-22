import {
  customElement,
  html,
  css,
  FASTElement,
  attr,
} from '@microsoft/fast-element';
import { inject } from '@microsoft/fast-element/di.js';
import GlizzyState from './state.js';

const template = html`
  <img
    draggable="false"
    src="./img/glizzy_${() => Math.floor(Math.random() * 3) + 1}.png"
  />
`;

const styles = css`
  :host {
    display: block;
    position: absolute;
    cursor: grab;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
    transition: transform 0.2s ease, filter 0.2s ease;
  }

  img {
    width: 100%;
    display: block;
  }

  :host([dragging]) {
    cursor: grabbing;
    transform: scale(1.2);
    pointer-events: none;
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.8));
  }

  :host([eaten]) {
    animation: eatAnimation 0.5s ease-out forwards;
  }

  @keyframes eatAnimation {
    0% {
      transform: scale(1);
      opacity: 1;
    }

    50% {
      transform: scale(0.5) rotate(180deg);
      opacity: 0.8;
    }

    100% {
      transform: scale(0) rotate(360deg);
      opacity: 0;
    }
  }
`;

@customElement({ name: 'random-glizzy', template, styles })
export class RandomGlizzy extends FASTElement {
  @attr({ mode: 'boolean' }) dragging: boolean = false;
  @attr({ mode: 'boolean' }) eaten: boolean = false;
  @inject(GlizzyState) gs!: GlizzyState;

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListeners();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListeners();
  }

  addEventListeners() {
    this.addEventListener('mousedown', this.handleMouseDown);
  }

  removeEventListeners() {
    this.removeEventListener('mousedown', this.handleMouseDown);
  }

  handleMouseDown = (e: MouseEvent): void => {
    e.preventDefault();
    this.gs.glizzyStartDrag(this, e.clientX, e.clientY);
  };
}
