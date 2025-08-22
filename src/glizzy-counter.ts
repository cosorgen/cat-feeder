import {
  customElement,
  html,
  css,
  FASTElement,
  volatile,
} from '@microsoft/fast-element';
import { inject } from '@microsoft/fast-element/di.js';
import GlizzyState from './state.js';

const template = html` <div id="counter-display">
    <h2>Glizzies guzzled: ${(x) => x.formattedNumber}</h2>
  </div>
  <div id="instructions">
    <p>Drag hotdogs to feed the cat! 🚀🐱🌭</p>
  </div>`;

const styles = css`
  :host {
    display: block;
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 100;
    color: white;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  }

  #counter-display h2 {
    font-size: 2rem;
    margin-bottom: 10px;
    background: rgba(0, 0, 0, 0.5);
    padding: 10px 20px;
    border-radius: 10px;
    border: 2px solid #fff;
  }

  #instructions p {
    font-size: 1.2rem;
    background: rgba(0, 0, 0, 0.5);
    padding: 8px 16px;
    border-radius: 8px;
  }
`;

@customElement({ name: 'glizzy-counter', template, styles })
export class GlizzyCounter extends FASTElement {
  @inject(GlizzyState) gs!: GlizzyState;

  @volatile
  get formattedNumber() {
    if (this.gs.glizziesGuzzled > 1000 && this.gs.glizziesGuzzled < 1000000) {
      return `${new Intl.NumberFormat().format(
        this.gs.glizziesGuzzled / 1000
      )}K`;
    }
    if (this.gs.glizziesGuzzled > 1000000) {
      return `${new Intl.NumberFormat().format(
        this.gs.glizziesGuzzled / 1000000
      )}M`;
    }
    return new Intl.NumberFormat().format(this.gs.glizziesGuzzled);
  }
}
