import { css, customElement, FASTElement, html } from '@microsoft/fast-element';

import './glizzy-counter.js';
import './fat-cat.js';
import './glizzy-pile.js';
import './drop-feedback.js';
import { inject } from '@microsoft/fast-element/di.js';
import GlizzyState from './state.js';

const template = html`
  <img src="./img/bg.png" alt="Space Background" id="bg" draggable="false" />
  <glizzy-counter></glizzy-counter>
  <fat-cat></fat-cat>
  <glizzy-pile></glizzy-pile>
  <drop-feedback></drop-feedback>
</div>`;

const styles = css`
  :host {
    display: block;
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    cursor: ${(x) => (x.gs.isDragging ? 'grabbing' : 'grab')} !important;
  }

  #bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

@customElement({ name: 'cat-glizzier', template, styles })
export class CatGlizzier extends FASTElement {
  @inject(GlizzyState) gs!: GlizzyState;

  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('contextmenu', (e: Event) => e.preventDefault());
  }
}
