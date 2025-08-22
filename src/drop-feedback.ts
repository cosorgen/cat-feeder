import {
  customElement,
  html,
  css,
  FASTElement,
  attr,
  Observable,
} from '@microsoft/fast-element';
import { inject } from '@microsoft/fast-element/di.js';
import GlizzyState from './state.js';

const template = html`Nom nom! 🐱`;

const styles = css`
  :host {
    display: none;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 200;
    font-size: 2rem;
    font-weight: bold;
    color: #ffff00;
    text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.8);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s linear;
    overflow: hidden;
    text-align: center;
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
  @inject(GlizzyState) gs!: GlizzyState;
  responses: string[] = [
    'This… is not chicken. 😾',
    'Why is my meat in tube form, human? 🤨',
    'Strange… but acceptable. 😼',
    'MORE! You dare tease me with just one? 😹',
    'Finally, you’ve learned my royal tastes. Keep them coming. 👑🐾',
    'THE TUBE MEAT! THE TUBE MEAT!! 🐱🌭',
    'You think this compares to salmon? Amateur. 🙀',
    'Call me when you’ve got tuna. 🐟',
    'Hot… dog? I am a cat. Do you hear yourself? 🙄🐾',
    'BEST. DAY. EVER. 😻',
    'Mphh… hot… purrfect… 🤤',
    'I’ll allow you to pet me now. You’ve earned it. 😼❤️',
    '...My stomach feels funny, but it was worth it. 🤢',
    'burps I may perish… but what a glorious feast. 💀',
    'Note to self: maybe only half a hotdog next time. 😿',
  ];

  connectedCallback() {
    super.connectedCallback();
    Observable.getNotifier(this.gs).subscribe(this, 'glizziesGuzzled');
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    Observable.getNotifier(this.gs).unsubscribe(this);
  }

  handleChange(subject: any, attr: any) {
    if (attr === 'glizziesGuzzled' && this.gs.loading === false) {
      this.responses.sort(() => Math.random() - 0.5);
      this.shadowRoot!.textContent = this.responses[0];
      this.show = true;
      this.style.display = 'block';
      setTimeout(() => {
        this.show = false;
      }, 1000);
    }
  }
}
