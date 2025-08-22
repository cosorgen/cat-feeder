import {
  css,
  customElement,
  FASTElement,
  html,
  repeat,
} from '@microsoft/fast-element';
import { inject } from '@microsoft/fast-element/di.js';
import GlizzyState from './state.js';
import './glizzy-counter.js';
import './fat-cat.js';
import './glizzy-pile.js';
import './drop-feedback.js';
import './audio-player.js';
import './owner-donate.js';

const template = html`
  <img src="./img/bg.png" alt="Space Background" id="bg" draggable="false" />
  ${repeat(() => Array.from({ length: 50 }), html`<div class="star"></div>`)}
  <glizzy-counter></glizzy-counter>
  <fat-cat></fat-cat>
  <glizzy-pile></glizzy-pile>
  <drop-feedback></drop-feedback>
  <audio-player></audio-player>
  <owner-donate></owner-donate>
</div>`;

const styles = css`
  :host {
    display: block;
    position: relative;
    width: 100svw;
    height: 100svh;
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

  .star {
    position: absolute;
    background: rgba(255, 255, 255, 1);
    border-radius: 50%;
    filter: blur(2px) drop-shadow(0 0 6px white);
    mix-blend-mode: screen;
    animation: twinkle 1.5s linear infinite;
  }

  @media (prefers-reduced-motion: reduce), only screen and (max-width: 480px) {
    .star {
      animation: none;
    }
  }

  @keyframes twinkle {
    0% {
      transform: scale(0.8) translateY(-10px);
      opacity: 0;
    }
    50% {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
    100% {
      transform: scale(1.2) translateY(10px);
      opacity: 0;
    }
  }
`;

@customElement({ name: 'cat-glizzier', template, styles })
export class CatGlizzier extends FASTElement {
  @inject(GlizzyState) gs!: GlizzyState;

  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('contextmenu', (e: Event) => e.preventDefault());

    this.shadowRoot?.querySelectorAll('.star').forEach((star) => {
      (star as HTMLDivElement).style.left = `${Math.random() * 100}vw`;
      (star as HTMLDivElement).style.top = `${Math.random() * 100}vh`;
      (star as HTMLDivElement).style.width = `${Math.random() * 5 + 2}px`;
      (star as HTMLDivElement).style.height = (
        star as HTMLDivElement
      ).style.width;
      (star as HTMLDivElement).style.animationDuration = `${
        Math.random() + 1
      }s`;
      (star as HTMLDivElement).style.background = `rgb(${Math.floor(
        Math.random() * 256
      )}, ${Math.floor(Math.random() * 256)}, ${Math.floor(
        Math.random() * 256
      )})`;
      (star as HTMLDivElement).style.animationDelay = `${Math.random() * 2}s`;
    });
  }
}
