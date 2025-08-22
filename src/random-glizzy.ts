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
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
    transition: transform 0.2s ease, filter 0.2s ease, inset 0.2s ease,
      rotate 0.2s ease;
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
    rotate: 0deg !important;
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
  _glizziesGuzzled: number = 0;

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
    this.addEventListener('touchstart', this.handleMouseDown);
  }

  removeEventListeners() {
    this.removeEventListener('mousedown', this.handleMouseDown);
    this.removeEventListener('touchstart', this.handleMouseDown);
  }

  handleMouseDown = (e: MouseEvent | TouchEvent): void => {
    e.preventDefault();
    let clientX: number;
    let clientY: number;

    if (e instanceof TouchEvent) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    if (this.gs.isDragging) return;

    this.dragging = true;
    this.gs.isDragging = true;
    this._glizziesGuzzled = this.gs.glizziesGuzzled; // track to know if success

    // Store offset for smooth dragging
    const rect = this.getBoundingClientRect();
    this.dataset.offsetX = (clientX - rect.left).toString();
    this.dataset.offsetY = (clientY - rect.top).toString();
    this.dataset.position = this.style.position;
    this.dataset.left = this.style.left;
    this.dataset.right = this.style.right;
    this.dataset.top = this.style.top;
    this.dataset.bottom = this.style.bottom;
    this.dataset.zIndex = this.style.zIndex;
    this.dataset.translate = this.style.translate;
    this.dataset.rotate = this.style.rotate;

    // add listener for drag & drop
    document.addEventListener('mousemove', this.handleDrag);
    document.addEventListener('touchmove', this.handleDrag);
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('touchend', this.handleMouseUp);
  };

  // Mouse move handler for dragging
  handleDrag = (e: MouseEvent | TouchEvent): void => {
    let clientX: number;
    let clientY: number;

    if (e instanceof TouchEvent) {
      e.preventDefault();
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    if (this.dragging) {
      const offsetX = parseInt(this.dataset.offsetX || '0');
      const offsetY = parseInt(this.dataset.offsetY || '0');

      this.style.position = 'fixed';
      this.style.left = clientX - offsetX + 'px';
      this.style.bottom = window.innerHeight - clientY - offsetY + 'px';
      this.style.right = 'auto';
      this.style.top = 'auto';
      this.style.zIndex = '1000';
      this.style.translate = '0 0';
      this.style.transition = 'none';
      this.style.rotate = '0deg';
    }
  };

  handleMouseUp = (): void => {
    if (this.dragging) {
      const dropSuccess = this.gs.glizziesGuzzled > this._glizziesGuzzled;

      if (dropSuccess) {
        this.eaten = true;
      } else {
        // Reset hotdog
        this.style.transition =
          'transform 0.2s ease, filter 0.2s ease, inset 0.2s ease, rotate 0.2s ease';
        this.style.position = this.dataset.position || 'absolute';
        this.style.left = this.dataset.left || 'auto';
        this.style.top = this.dataset.top || 'auto';
        this.style.bottom = this.dataset.bottom || 'auto';
        this.style.right = this.dataset.right || 'auto';
        this.style.zIndex = this.dataset.zIndex || '1';
        this.style.translate = this.dataset.translate || 'none';
        this.style.rotate = this.dataset.rotate || '0deg';
      }

      // Clean up
      this.gs.isDragging = false;
      this.dragging = false;
      document.removeEventListener('mousemove', this.handleDrag);
      document.removeEventListener('mouseup', this.handleMouseUp);
    }
  };
}
