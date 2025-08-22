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

const template = html` <div popover>
  <h4>Feed my owner too! 😺</h4>
  <a href="https://paypal.me/codysorgenfrey" target="_blank">Send them a hotdog.</a>
</div>`;

const styles = css`
  [popover]:popover-open {
    display: flex;
    opacity: 1;
    transform: translateY(0);
  }

  [popover] {
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

  ::backdrop {
    background: rgba(0, 0, 0, 0.5);
  }

  @starting-style {
    [popover]:popover-open {
      opacity: 0;
      transform: translateY(-25%);
    }
  }

  h4 {
    margin: 0;
  }

  a {
    color: rgba(124, 229, 255, 1);
  }
`;

@customElement({ name: 'owner-donate', template, styles })
export class OwnerDonate extends FASTElement {
  @inject(GlizzyState) gs!: GlizzyState;
  _popover!: HTMLDivElement;

  connectedCallback(): void {
    super.connectedCallback();
    this._popover = this.shadowRoot?.querySelector(
      '[popover]'
    ) as HTMLDivElement;

    Observable.getNotifier(this.gs).subscribe(this, 'glizziesGuzzled');
  }

  handleChange(sub: any, prop: string) {
    if (prop === 'glizziesGuzzled') {
      if (this.gs.glizziesGuzzled % 5 === 0) {
        setTimeout(() => {
          this._popover.showPopover();
        }, 3000);
      }
    }
  }
}
