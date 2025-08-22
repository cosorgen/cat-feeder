import {
  customElement,
  html,
  css,
  FASTElement,
  observable,
} from '@microsoft/fast-element';
import './random-glizzy.js';
import { RandomGlizzy } from './random-glizzy.js';

const template = html``;

const styles = css`
  :host {
    display: block;
    position: absolute;
    bottom: -15vh;
    left: -5vh;
    right: 25vw;
    height: 156px;
  }

  random-glizzy {
    position: absolute;
    bottom: 0;
    left: 0;
  }
`;

@customElement({ name: 'glizzy-pile', template, styles })
export class GlizzyPile extends FASTElement {
  @observable glizzies: Array<RandomGlizzy> = [];

  connectedCallback(): void {
    super.connectedCallback();
    this.generateGlizPile();
  }

  generateGlizPile(): void {
    this.glizzies = Array.from({ length: 100 }, () => {
      const gliz = new RandomGlizzy();
      const width = Math.max(Math.random() * 256, 152);
      gliz.style.width = `${width}px`;
      gliz.style.rotate = `${Math.random() * 56}deg`;

      const x = `calc(${Math.random() * 100}% - ${width}px)`;
      const y = `${Math.random() * this.getBoundingClientRect().height}px`;
      gliz.style.left = x;
      gliz.style.bottom = y;
      this.shadowRoot?.appendChild(gliz);
      return gliz;
    });

    // Sort glizzies by their size (biggest in the front)
    this.glizzies.sort((a, b) => {
      const aRect = a.getBoundingClientRect();
      const bRect = b.getBoundingClientRect();
      return bRect.width - aRect.width || bRect.height - aRect.height;
    });

    this.glizzies.forEach((gliz, index) => {
      gliz.style.zIndex = `${this.glizzies.length - index}`;
      gliz.style.translate = `0 -${index * 2}px`;
    });
  }
}
