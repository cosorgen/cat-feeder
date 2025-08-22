import {
  customElement,
  html,
  css,
  FASTElement,
  observable,
  attr,
} from '@microsoft/fast-element';
import { inject } from '@microsoft/fast-element/di.js';
import GlizzyState from './state.js';

const template = html` <img
    src="./img/cat_body.png"
    alt="Cat Body"
    id="cat-body"
    draggable="false"
  />
  <div id="cat-head">
    <img
      src="./img/cat_eyes_${(x) => x.direction}.png"
      alt="Cat Eyes"
      id="cat-eyes"
      draggable="false"
    />
    <img
      src="./img/cat_face_${(x) => x.direction}.png"
      alt="Cat Face"
      id="cat-face"
      draggable="false"
    />
  </div>`;

const styles = css`
  :host {
    display: block;
    position: absolute;
    bottom: -5vh;
    right: 0;
    width: 100%;
    max-width: 640px;
    min-width: 384px;
    transition: filter 0.2s;
  }

  @media only screen and (max-width: 480px) {
    :host {
      bottom: 0;
      right: -10vw;
      width: 120%;
      max-width: unset;
    }
  }

  :host([is-over-head]) {
    filter: drop-shadow(0 0 104px rgba(255, 191, 123, 0.5));
  }

  #cat-body {
    width: 100%;
  }

  #cat-head {
    position: absolute;
    width: 64.7%; /* Calculated from Figma */
    left: 23.9%;
    bottom: 65%;
  }

  #cat-face {
    position: relative;
    width: 100%;
  }

  #cat-eyes {
    position: absolute;
    width: 100%;
    left: 0%;
    top: 0%;

    transition: transform 100ms ease;
  }
`;

type CatDirection = 'left' | 'right' | 'up' | 'down' | 'open';

@customElement({ name: 'fat-cat', template, styles })
export class FatCat extends FASTElement {
  @attr({ mode: 'boolean', attribute: 'is-over-head' }) isOverHead = false;
  @observable direction: CatDirection = 'left';
  @inject(GlizzyState) gs!: GlizzyState;
  _catBody?: HTMLImageElement;
  _catHead?: HTMLDivElement;
  _catFace?: HTMLImageElement;
  _catEyes?: HTMLImageElement;

  connectedCallback(): void {
    super.connectedCallback();
    this.setElements();
    this.addEventListeners();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListeners();
    this.unsetElements();
  }

  setElements() {
    this._catBody = this.shadowRoot?.getElementById(
      'cat-body'
    ) as HTMLImageElement;
    this._catHead = this.shadowRoot?.getElementById(
      'cat-head'
    ) as HTMLDivElement;
    this._catFace = this.shadowRoot?.getElementById(
      'cat-face'
    ) as HTMLImageElement;
    this._catEyes = this.shadowRoot?.getElementById(
      'cat-eyes'
    ) as HTMLImageElement;
  }

  unsetElements() {
    this._catBody = undefined;
    this._catHead = undefined;
    this._catFace = undefined;
    this._catEyes = undefined;
  }

  addEventListeners() {
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('touchmove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('touchend', this.handleMouseUp);
  }

  removeEventListeners() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('touchmove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('touchend', this.handleMouseUp);
  }

  handleMouseMove = (e: MouseEvent | TouchEvent): void => {
    let clientX: number;
    let clientY: number;

    if (e instanceof TouchEvent) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    this.updateIsOverHead(clientX, clientY);
    this.updateCatDirection(this.getCursorDirection(clientX, clientY));
    this.updateEyesDirection(clientX, clientY);
  };

  handleMouseUp = (): void => {
    if (this.isOverHead && this.gs.isDragging) {
      this.gs.incrementGlizzyCount();
      this.isOverHead = false;
      this.direction = 'left';
    }
  };

  updateCatDirection(direction: CatDirection): void {
    if (direction === this.direction) return;
    this.direction = direction;
  }

  updateEyesDirection(x: number, y: number): void {
    if (!this._catEyes || !this._catHead) {
      console.error('Cat parts not found');
      return;
    }

    const catHeadCenterX =
      this._catHead.getBoundingClientRect().left +
      this._catHead.getBoundingClientRect().width / 2;
    const catHeadCenterY =
      this._catHead.getBoundingClientRect().top +
      this._catHead.getBoundingClientRect().height / 2;
    const xPercentage = (x - catHeadCenterX) / window.innerWidth;
    const yPercentage = (y - catHeadCenterY) / window.innerHeight;

    this._catEyes.style.transform = `translate(${12 * xPercentage}px, ${
      12 * yPercentage
    }px)`;
  }

  getCursorDirection(x: number, y: number): CatDirection {
    if (!this._catHead) {
      console.error('Cat head element not found');
      return 'left';
    }

    if (this.isOverHead && this.gs.isDragging) {
      return 'open';
    }

    const catRect = this._catHead.getBoundingClientRect();
    const catCenterX = catRect.left + catRect.width / 2;
    const catCenterY = catRect.top + catRect.height / 2;

    const deltaX = x - catCenterX;
    const deltaY = y - catCenterY;

    // Determine primary direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }

  updateIsOverHead(x: number, y: number): void {
    if (!this._catHead) {
      console.error('Cat head element not found');
      return;
    }

    if (!this.gs.isDragging) {
      this.isOverHead = false;
      return;
    }

    const catRect = this._catHead.getBoundingClientRect();
    const inset = 100;

    this.isOverHead =
      x >= catRect.left + inset &&
      x <= catRect.left + catRect.width - inset &&
      y >= catRect.top + inset &&
      y <= catRect.top + catRect.height - inset;
  }
}
