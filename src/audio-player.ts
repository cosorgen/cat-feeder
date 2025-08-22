import {
  css,
  html,
  customElement,
  FASTElement,
  observable,
  Observable,
} from '@microsoft/fast-element';
import { inject } from '@microsoft/fast-element/di.js';
import GlizzyState from './state.js';

const template = html`<button popovertarget="audio-menu">
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15 4.25049V19.7461C15 20.8247 13.7255 21.397 12.9194 20.6802L8.42793 16.6865C8.29063 16.5644 8.11329 16.497 7.92956 16.497H4.25C3.00736 16.497 2 15.4896 2 14.247V9.74907C2 8.50643 3.00736 7.49907 4.25 7.49907H7.92961C8.11333 7.49907 8.29065 7.43165 8.42794 7.30958L12.9195 3.31631C13.7255 2.59964 15 3.17187 15 4.25049ZM18.9916 5.89782C19.3244 5.65128 19.7941 5.72126 20.0407 6.05411C21.2717 7.71619 22 9.77439 22 12.0005C22 14.2266 21.2717 16.2848 20.0407 17.9469C19.7941 18.2798 19.3244 18.3497 18.9916 18.1032C18.6587 17.8567 18.5888 17.387 18.8353 17.0541C19.8815 15.6416 20.5 13.8943 20.5 12.0005C20.5 10.1067 19.8815 8.35945 18.8353 6.9469C18.5888 6.61404 18.6587 6.14435 18.9916 5.89782ZM17.143 8.36982C17.5072 8.17262 17.9624 8.30806 18.1596 8.67233C18.6958 9.66294 19 10.7973 19 12.0005C19 13.2037 18.6958 14.338 18.1596 15.3287C17.9624 15.6929 17.5072 15.8284 17.143 15.6312C16.7787 15.434 16.6432 14.9788 16.8404 14.6146C17.2609 13.8378 17.5 12.9482 17.5 12.0005C17.5 11.0528 17.2609 10.1632 16.8404 9.38642C16.6432 9.02216 16.7787 8.56701 17.143 8.36982Z"
        fill="currentcolor"
      />
    </svg>
  </button>
  <div id="audio-menu" popover>
    <h4>Background music</h4>
    <audio id="music" autoplay controls loop>
      <source src="./audio/Hymn_of_the_Cosmic_Cat.mp3" type="audio/mpeg" />
    </audio>
    <h4>Foley</h4>
    <audio id="foley" autoplay controls>
      <source src="./audio/cat_meow_${(x) => x.meow}.mp3" type="audio/mpeg" />
    </audio>
    <h4>SFX</h4>
    <audio id="sfx" controls>
      <source src="./audio/cat_eat_1.mp3" type="audio/mpeg" />
    </audio>
  </div>`;

const styles = css`
  button {
    line-height: 0;
    position: absolute;
    background: rgba(0, 0, 0, 0.5);
    padding: 8px;
    border-radius: 10px;
    border: 2px solid #fff;
    color: white;
    cursor: pointer;
    top: 20px;
    right: 20px;

    &:hover {
      box-shadow: 0 0 16px rgba(255, 255, 0, 1);
    }
  }

  #audio-menu:popover-open {
    display: flex;
    opacity: 1;
    transform: translateY(0);
  }

  #audio-menu {
    background: rgba(0, 0, 0, 0.5);
    padding: 10px 20px;
    border-radius: 10px;
    border: 2px solid #fff;
    color: white;
    flex-direction: column;
    gap: 8px;
    backdrop-filter: blur(40px);
    cursor: default;

    opacity: 0;
    transform: translateY(-25%);

    transition: opacity 0.2s cubic-bezier(0.2, 0.8, 0, 1),
      transform 0.2s cubic-bezier(0.2, 0.8, 0, 1), display 0.2s allow-discrete,
      overlay 0.2s allow-discrete;
  }

  @starting-style {
    #audio-menu:popover-open {
      opacity: 0;
      transform: translateY(-25%);
    }
  }

  h4 {
    margin: 8px 0 0 0;
  }
`;

@customElement({ name: 'audio-player', template, styles })
export class AudioPlayer extends FASTElement {
  @inject(GlizzyState) gs!: GlizzyState;
  @observable meow: number = Math.floor(Math.random() * 5) + 1;
  _music!: HTMLAudioElement;
  _foley!: HTMLAudioElement;
  _sfx!: HTMLAudioElement;

  connectedCallback(): void {
    super.connectedCallback();
    this._music = this.shadowRoot?.querySelector('#music') as HTMLAudioElement;
    this._foley = this.shadowRoot?.querySelector('#foley') as HTMLAudioElement;
    this._sfx = this.shadowRoot?.querySelector('#sfx') as HTMLAudioElement;

    if (this._music && this._foley && this._sfx) {
      this._music.volume = 0.1;
      this._foley.volume = 0.15;
      this._sfx.volume = 0.2;
    }

    this.setupFoley();

    Observable.getNotifier(this.gs).subscribe(this, 'glizziesGuzzled');
  }

  setupFoley() {
    setTimeout(() => {
      if (this._foley) {
        this._foley.currentTime = 0;
        this._foley.play();
        this.setupFoley();
      }
    }, Math.max(Math.random() * 32000, 8000));
  }

  handleChange(sub: any, prop: string) {
    if (prop === 'glizziesGuzzled' && !this.gs.loading) {
      this.meow = Math.floor(Math.random() * 5) + 1;
      this._sfx.currentTime = 0;
      this._sfx.play();
    }
  }
}
