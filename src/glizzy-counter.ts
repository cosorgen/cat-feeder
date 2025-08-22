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
    top: 0;
    left: 0;
    z-index: 100;
    color: white;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    overflow: hidden;
    text-align: center;
    margin: 20px;
  }

  div {
    margin-bottom: 10px;
    background: rgba(0, 0, 0, 0.5);
    padding: 10px 20px;
    border-radius: 10px;
    border: 2px solid #fff;
  }

  h2 {
    margin: 0;
    font-size: 2rem;
  }
  
  p {
    margin: 0;
    font-size: 1.2rem;
  }

  @media only screen and (max-width: 480px) {
    h2 {
      font-size: 1.5rem;
    }

    p {
      font-size: 1rem;
    }
  }
`;

@customElement({ name: 'glizzy-counter', template, styles })
export class GlizzyCounter extends FASTElement {
  @inject(GlizzyState) gs!: GlizzyState;

  @volatile
  get formattedNumber() {
    if (
      this.gs.globalGlizziesGuzzled > 1000 &&
      this.gs.globalGlizziesGuzzled < 1000000
    ) {
      return `${new Intl.NumberFormat().format(
        this.gs.globalGlizziesGuzzled / 1000
      )}K`;
    }
    if (this.gs.globalGlizziesGuzzled > 1000000) {
      return `${new Intl.NumberFormat().format(
        this.gs.globalGlizziesGuzzled / 1000000
      )}M`;
    }
    return new Intl.NumberFormat().format(this.gs.globalGlizziesGuzzled);
  }
}
