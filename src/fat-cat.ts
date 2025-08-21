import { customElement, html, css, FASTElement } from '@microsoft/fast-element';

const template = html` <img
    src="./img/cat_body.png"
    alt="Cat Body"
    id="cat-body"
    draggable="false"
  />
  <div id="cat-head">
    <img
      src="./img/cat_eyes_left.png"
      alt="Cat Eyes"
      id="cat-eyes"
      draggable="false"
    />
    <img
      src="./img/cat_face_left.png"
      alt="Cat Face"
      id="cat-face"
      draggable="false"
    />
    <div id="cat-mouth"></div>
  </div>`;

const styles = css`
  :host {
    display: block;
    opacity: 0;
    position: absolute;
    top: 0;
    right: 0;
    width: 50%;
    height: 100%;

    transition: opacity 0.5s;
  }

  #cat-body {
    position: absolute;
    bottom: -5vh;
    width: 100%;
  }

  #cat-head {
    position: absolute;
    width: 60%;
    left: 25%;
  }

  #cat-face {
    position: relative;
    width: 100%;
  }

  #cat-eyes {
    position: absolute;
    width: 60%;
    left: 0%;
    top: 31%;
  }

  #cat-mouth {
    position: absolute;
    top: 65%;
    left: 20%;
    width: 120px;
    height: 80px;
    border-radius: 50%;
    transition: all 0.3s ease;
  }

  #cat-mouth.drop-zone-active {
    background-color: rgba(255, 255, 0, 0.1);
    box-shadow: 0 0 120px rgba(255, 255, 0, 0.6);
  }
`;

@customElement({ name: 'fat-cat', template, styles })
export class FatCat extends FASTElement {}
