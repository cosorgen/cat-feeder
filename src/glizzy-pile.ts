import { customElement, html, css, FASTElement } from '@microsoft/fast-element';

const template = html``;

const styles = css`
  :host {
    display: block;
    position: absolute;
    bottom: 0px;
    left: 0px;
    right: 0px;
  }

  .hotdog {
    cursor: grab;
    width: 240px;
    transition: transform 0.2s ease, filter 0.2s ease;
  }

  .hotdog.dragging {
    cursor: grabbing;
    transform: scale(1.2);
    pointer-events: none;
    filter: drop-shadow(5px 5px 10px rgba(0, 0, 0, 0.8));
  }

  .hotdog.eaten {
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

@customElement({ name: 'glizzy-pile', template, styles })
export class GlizzyPile extends FASTElement {}
