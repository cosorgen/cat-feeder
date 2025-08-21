import {
  customElement,
  html,
  css,
  FASTElement,
  observable,
} from '@microsoft/fast-element';
import type { CatDirection } from './types.js';
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
    <div id="cat-mouth"></div>
  </div>`;

const styles = css`
  :host {
    display: block;
    position: absolute;
    bottom: -5vh;
    right: 0;
    width: 50%;
    max-width: 640px;
    min-width: 384px;
  }

  #cat-body {
    width: 100%;
  }

  #cat-head {
    position: absolute;
    width: 64.7%; /* Calculated from Figma */
    left: 23.9%;
    bottom: 65.4%;
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
  }

  #cat-mouth {
    position: absolute;
    top: 65%;
    left: 20%;
    width: 120px;
    height: 80px;
    border-radius: 50%;
    transition: all 0.3s ease;
  }

  #cat-mouth.drop-zone-active {
    background-color: rgba(255, 255, 0, 0.1);
    box-shadow: 0 0 120px rgba(255, 255, 0, 0.6);
  }
`;

@customElement({ name: 'fat-cat', template, styles })
export class FatCat extends FASTElement {
  _catBody!: HTMLImageElement;
  _catHead!: HTMLDivElement;
  _catFace!: HTMLImageElement;
  _catEyes!: HTMLImageElement;
  _catMouth!: HTMLDivElement;
  @observable direction: CatDirection = 'left';
  @inject(GlizzyState) gs!: GlizzyState;

  connectedCallback(): void {
    super.connectedCallback();
    this.setElements();
    this.addEventListeners();
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

  addEventListeners() {
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('touchmove', this.handleTouchMove);
  }

  handleMouseMove = (e: MouseEvent): void => {
    if (!this.gs.isDragging) {
      this.updateCatDirection(this.getCursorDirection(e.clientX, e.clientY));
      this.updateEyesDirection(e.clientX, e.clientY);
    }
  };

  handleTouchMove = (e: TouchEvent): void => {
    if (e.touches.length > 0 && !this.gs.isDragging) {
      const touch = e.touches[0];
      if (touch) {
        this.updateCatDirection(
          this.getCursorDirection(touch.clientX, touch.clientY)
        );
        this.updateEyesDirection(touch.clientX, touch.clientY);
      }
    }
  };

  updateCatDirection(direction: CatDirection): void {
    if (direction === this.direction) return;

    this.direction = direction;

    if (!this._catFace || !this._catEyes || !this._catHead) {
      console.error('Cat face, eyes, or head element not found');
      return;
    }
  }

  updateEyesDirection(x: number, y: number): void {
    if (!this._catEyes) {
      console.error('Cat eyes element not found');
      return;
    }

    const catHeadCenterX =
      this._catHead.getBoundingClientRect().left +
      this._catHead.getBoundingClientRect().width / 2;
    const catHeadCenterY =
      this._catHead.getBoundingClientRect().top +
      this._catHead.getBoundingClientRect().height / 2;
    const xPercentage = (x - catHeadCenterX) / (window.innerWidth * 2);
    const yPercentage = (y - catHeadCenterY) / (window.innerHeight * 2);

    this._catEyes.style.transform = `translate(${25 * xPercentage}px, ${
      25 * yPercentage
    }px)`;
  }

  getCursorDirection(x: number, y: number): CatDirection {
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
}
