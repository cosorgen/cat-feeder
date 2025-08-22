import {
  customElement,
  html,
  css,
  FASTElement,
  attr,
} from '@microsoft/fast-element';

const template = html`Nom nom! 🐱`;

const styles = css`
  :host {
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 200;
    font-size: 3rem;
    font-weight: bold;
    color: #ffff00;
    text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.8);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  :host([show]) {
    opacity: 1;
    animation: feedbackPulse 0.6s ease-out;
  }

  @keyframes feedbackPulse {
    0% {
      transform: translate(-50%, -50%) scale(0.5);
    }

    50% {
      transform: translate(-50%, -50%) scale(1.2);
    }

    100% {
      transform: translate(-50%, -50%) scale(1);
    }
  }
`;

@customElement({ name: 'drop-feedback', template, styles })
export class DropFeedback extends FASTElement {
  @attr({ mode: 'boolean' }) show = false;
}
