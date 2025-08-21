import { css, customElement, FASTElement, html } from '@microsoft/fast-element';
import type { GameState, CatDirection, Directions, DropZone } from './types.js';

// Game State
const gameState: GameState = {
  supabase: null,
  currentHotdogCount: 0,
  catDirection: 'up',
  isDragging: false,
  draggedElement: null,
  hotdogPileCount: 3,
};

// Direction mappings for cat face and eyes
const directions: Directions = {
  up: { face: 'cat_face_up.png', eyes: 'cat_eyes_up.png' },
  down: { face: 'cat_face_down.png', eyes: 'cat_eyes_down.png' },
  left: { face: 'cat_face_left.png', eyes: 'cat_eyes_left.png' },
  right: { face: 'cat_face_right.png', eyes: 'cat_eyes_right.png' },
};

// Hotdog image filenames
const hotdogImages: string[] = ['glizzy_1.png', 'glizzy_2.png', 'glizzy_3.png'];

// Setup event listeners
function setupEventListeners(): void {
  // Drag and drop events
  document.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('mouseup', handleMouseUp);

  // Touch events for mobile drag and drop
  document.addEventListener('touchstart', handleTouchStart);
  document.addEventListener('touchmove', handleTouchDrag);
  document.addEventListener('touchend', handleTouchEnd);

  // Prevent context menu on right click
  document.addEventListener('contextmenu', (e: Event) => e.preventDefault());
}

// Create hotdog pile
function createHotdogPile(): void {
  const pile = document.getElementById('hotdog-pile') as HTMLElement;
  if (!pile) {
    console.error('Hotdog pile element not found');
    return;
  }

  for (let i = 0; i < gameState.hotdogPileCount; i++) {
    const hotdog = document.createElement('img');
    const randomImage =
      hotdogImages[Math.floor(Math.random() * hotdogImages.length)];
    hotdog.src = `images/${randomImage}`;
    hotdog.className = 'hotdog';
    hotdog.draggable = false; // We'll handle dragging manually
    hotdog.dataset.hotdogId = i.toString();
    pile.appendChild(hotdog);
  }
}

// Mouse down handler for drag start
function handleMouseDown(e: MouseEvent): void {
  const target = e.target as HTMLElement;
  if (
    target.classList.contains('hotdog') &&
    !target.classList.contains('eaten')
  ) {
    gameState.isDragging = true;
    gameState.draggedElement = target as HTMLImageElement;
    gameState.draggedElement.classList.add('dragging');

    // Store offset for smooth dragging
    const rect = gameState.draggedElement.getBoundingClientRect();
    gameState.draggedElement.dataset.offsetX = (
      e.clientX - rect.left
    ).toString();
    gameState.draggedElement.dataset.offsetY = (
      e.clientY - rect.top
    ).toString();

    e.preventDefault();
  }
}

// Mouse move handler for dragging
function handleDrag(e: MouseEvent): void {
  if (gameState.isDragging && gameState.draggedElement) {
    const offsetX = parseInt(gameState.draggedElement.dataset.offsetX || '0');
    const offsetY = parseInt(gameState.draggedElement.dataset.offsetY || '0');

    gameState.draggedElement.style.position = 'fixed';
    gameState.draggedElement.style.left = e.clientX - offsetX + 'px';
    gameState.draggedElement.style.top = e.clientY - offsetY + 'px';
    gameState.draggedElement.style.zIndex = '1000';

    // Check if over cat mouth
    checkDropZone(e.clientX, e.clientY);
  }
}

// Mouse up handler for drop
function handleMouseUp(e: MouseEvent): void {
  if (gameState.isDragging && gameState.draggedElement) {
    const dropSuccess = checkDropZone(e.clientX, e.clientY, true);

    if (dropSuccess) {
      feedCat(gameState.draggedElement);
    } else {
      // Return hotdog to pile
      returnHotdogToPile(gameState.draggedElement);
    }

    cleanupDrag();
  }
}

// Touch event handlers
function handleTouchStart(e: TouchEvent): void {
  const target = e.target as HTMLElement;
  if (
    target.classList.contains('hotdog') &&
    !target.classList.contains('eaten')
  ) {
    const touch = e.touches[0];
    if (!touch) return;

    gameState.isDragging = true;
    gameState.draggedElement = target as HTMLImageElement;
    gameState.draggedElement.classList.add('dragging');

    const rect = gameState.draggedElement.getBoundingClientRect();
    gameState.draggedElement.dataset.offsetX = (
      touch.clientX - rect.left
    ).toString();
    gameState.draggedElement.dataset.offsetY = (
      touch.clientY - rect.top
    ).toString();

    e.preventDefault();
  }
}

function handleTouchDrag(e: TouchEvent): void {
  if (
    gameState.isDragging &&
    gameState.draggedElement &&
    e.touches.length > 0
  ) {
    const touch = e.touches[0];
    if (!touch) return;

    const offsetX = parseInt(gameState.draggedElement.dataset.offsetX || '0');
    const offsetY = parseInt(gameState.draggedElement.dataset.offsetY || '0');

    gameState.draggedElement.style.position = 'fixed';
    gameState.draggedElement.style.left = touch.clientX - offsetX + 'px';
    gameState.draggedElement.style.top = touch.clientY - offsetY + 'px';
    gameState.draggedElement.style.zIndex = '1000';

    checkDropZone(touch.clientX, touch.clientY);
    e.preventDefault();
  }
}

function handleTouchEnd(e: TouchEvent): void {
  if (gameState.isDragging && gameState.draggedElement) {
    const touch = e.changedTouches[0];
    if (!touch) return;

    const dropSuccess = checkDropZone(touch.clientX, touch.clientY, true);

    if (dropSuccess) {
      feedCat(gameState.draggedElement);
    } else {
      returnHotdogToPile(gameState.draggedElement);
    }

    cleanupDrag();
  }
}

// Check if hotdog is over cat mouth
function checkDropZone(
  x: number,
  y: number,
  _isDrop: boolean = false
): boolean {
  const catMouth = document.getElementById('cat-mouth') as HTMLElement;
  if (!catMouth) {
    console.error('Cat mouth element not found');
    return false;
  }

  const mouthRect = catMouth.getBoundingClientRect();

  // Expand the drop zone slightly for better UX
  const expandedZone: DropZone = {
    left: mouthRect.left - 100,
    right: mouthRect.right + 100,
    top: mouthRect.top - 100,
    bottom: mouthRect.bottom + 100,
  };

  const isInZone =
    x >= expandedZone.left &&
    x <= expandedZone.right &&
    y >= expandedZone.top &&
    y <= expandedZone.bottom;

  // Visual feedback
  if (isInZone) {
    catMouth.classList.add('drop-zone-active');
  } else {
    catMouth.classList.remove('drop-zone-active');
  }

  return isInZone;
}

// Feed the cat (successful drop)
function feedCat(hotdogElement: HTMLImageElement): void {
  // Play eat animation
  hotdogElement.classList.add('eaten');

  // Show feedback
  showDropFeedback('Nom nom! 🐱');

  // Update counter
  // incrementHotdogCounter();

  // Remove hotdog after animation
  setTimeout((): void => {
    hotdogElement.remove();
    // Add a new hotdog to the pile
    addNewHotdogToPile();
  }, 500);

  // Remove drop zone highlight
  const catMouth = document.getElementById('cat-mouth') as HTMLElement;
  if (catMouth) {
    catMouth.classList.remove('drop-zone-active');
  }
}

// Return hotdog to pile (failed drop)
function returnHotdogToPile(hotdogElement: HTMLImageElement): void {
  hotdogElement.style.position = 'static';
  hotdogElement.style.left = 'auto';
  hotdogElement.style.top = 'auto';
  hotdogElement.style.zIndex = 'auto';

  // Add back to pile if it was removed
  const pile = document.getElementById('hotdog-pile') as HTMLElement;
  if (pile && !pile.contains(hotdogElement)) {
    pile.appendChild(hotdogElement);
  }
}

// Add new hotdog to pile
function addNewHotdogToPile(): void {
  const pile = document.getElementById('hotdog-pile') as HTMLElement;
  if (!pile) {
    console.error('Hotdog pile element not found');
    return;
  }

  const hotdog = document.createElement('img');
  const randomImage =
    hotdogImages[Math.floor(Math.random() * hotdogImages.length)];
  hotdog.src = `images/${randomImage}`;
  hotdog.className = 'hotdog';
  hotdog.draggable = false;
  hotdog.dataset.hotdogId = Date.now().toString(); // Unique ID

  // Add with a small delay for smooth appearance
  setTimeout((): void => {
    pile.appendChild(hotdog);
  }, 200);
}

// Cleanup drag state
function cleanupDrag(): void {
  if (gameState.draggedElement) {
    gameState.draggedElement.classList.remove('dragging');
    gameState.draggedElement = null;
  }
  gameState.isDragging = false;
  const catMouth = document.getElementById('cat-mouth') as HTMLElement;
  if (catMouth) {
    catMouth.classList.remove('drop-zone-active');
  }
}

// Show drop feedback
function showDropFeedback(message: string): void {
  const feedback = document.getElementById('drop-feedback') as HTMLElement;
  if (!feedback) {
    console.error('Drop feedback element not found');
    return;
  }

  feedback.textContent = message;
  feedback.classList.add('show');

  setTimeout((): void => {
    feedback.classList.remove('show');
  }, 600);
}

// Handle window resize
window.addEventListener('resize', (): void => {
  if (gameState.isDragging) {
    cleanupDrag();
  }
});

// Handle visibility change (tab switching)
document.addEventListener('visibilitychange', (): void => {
  if (document.hidden && gameState.isDragging) {
    cleanupDrag();
  }
});

import './glizzy-counter.js';
import './fat-cat.js';
import './glizzy-pile.js';
import './drop-feedback.js';

const template = html`
  <img src="./img/bg.png" alt="Space Background" id="bg" />
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
  override connectedCallback(): void {
    super.connectedCallback();
  }
}
