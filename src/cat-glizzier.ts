import { css, customElement, FASTElement, html } from '@microsoft/fast-element';
import { SUPABASE_CONFIG } from './config.js';
import type {
  GameState,
  CatDirection,
  Directions,
  DropZone,
  HotdogCounterRow,
} from './types.js';

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

// Initialize the game
document.addEventListener('DOMContentLoaded', (): void => {
  initializeSupabase();
  initializeGame();
  setupEventListeners();
  createHotdogPile();
  loadHotdogCounter();
});

// Initialize Supabase connection
function initializeSupabase(): void {
  try {
    if (
      SUPABASE_CONFIG.url &&
      SUPABASE_CONFIG.key &&
      SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL' &&
      SUPABASE_CONFIG.key !== 'YOUR_SUPABASE_ANON_KEY'
    ) {
      gameState.supabase = window.supabase.createClient(
        SUPABASE_CONFIG.url,
        SUPABASE_CONFIG.key
      );
    } else {
      console.warn('Supabase configuration not set. Using local counter.');
      // Use localStorage as fallback
      gameState.currentHotdogCount = parseInt(
        localStorage.getItem('hotdogCount') || '0'
      );
      updateCounterDisplay();
    }
  } catch (error) {
    console.error('Error initializing Supabase:', error);
    // Fallback to localStorage
    gameState.currentHotdogCount = parseInt(
      localStorage.getItem('hotdogCount') || '0'
    );
    updateCounterDisplay();
  }
}

// Initialize game elements
function initializeGame(): void {
  updateCatDirection('up');
  layoutCat();
}

function layoutCat() {
  const catContainer = document.getElementById('cat-container') as HTMLElement;
  const catBody = document.getElementById('cat-body') as HTMLImageElement;
  const catHead = document.getElementById('cat-head') as HTMLDivElement;
  const catFace = document.getElementById('cat-face') as HTMLImageElement;
  const catEyes = document.getElementById('cat-eyes') as HTMLImageElement;

  if (!catFace || !catEyes || !catHead || !catBody) {
    throw new Error('Required cat elements not found in DOM');
  }

  // Position cat parts
  catHead.style.bottom = `${catBody.getBoundingClientRect().height * 0.57}px`;

  // Show cat
  catContainer.style.opacity = '1';
}

// Setup event listeners
function setupEventListeners(): void {
  // Mouse movement for cat head tracking
  document.addEventListener('mousemove', handleMouseMove);

  // Touch support for mobile
  document.addEventListener('touchmove', handleTouchMove);

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

  window.addEventListener('resize', () => {
    layoutCat();
  });
}

// Handle mouse movement for cat tracking
function handleMouseMove(e: MouseEvent): void {
  if (!gameState.isDragging) {
    updateCatDirection(getCursorDirection(e.clientX, e.clientY));
  }
}

// Handle touch movement for cat tracking
function handleTouchMove(e: TouchEvent): void {
  if (e.touches.length > 0 && !gameState.isDragging) {
    const touch = e.touches[0];
    if (touch) {
      updateCatDirection(getCursorDirection(touch.clientX, touch.clientY));
    }
  }
}

// Calculate cursor direction relative to cat
function getCursorDirection(x: number, y: number): CatDirection {
  const catContainer = document.getElementById('cat-container') as HTMLElement;
  if (!catContainer) {
    return 'left'; // fallback
  }

  const catRect = catContainer.getBoundingClientRect();
  const catCenterX = catRect.left + catRect.width / 2;
  const catCenterY = catRect.top + catRect.height / 2;

  const deltaX = x - catCenterX;
  const deltaY = y - catCenterY;

  // Determine primary direction
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX > 0 ? 'right' : 'left';
  } else {
    return deltaY > 0 ? 'down' : 'up';
  }
}

// Update cat face and eyes direction
function updateCatDirection(direction: CatDirection): void {
  if (direction === gameState.catDirection) return;

  gameState.catDirection = direction;
  const catHead = document.getElementById('cat-head') as HTMLDivElement;
  const catFace = document.getElementById('cat-face') as HTMLImageElement;
  const catEyes = document.getElementById('cat-eyes') as HTMLImageElement;

  if (!catFace || !catEyes || !catHead) {
    console.error('Cat face, eyes, or head element not found');
    return;
  }

  const directionData = directions[direction];
  if (directionData) {
    catHead.classList.remove(...Object.keys(directions).map((dir) => dir));
    catHead.classList.add(direction);
    catFace.src = `images/${directionData.face}`;
    catEyes.src = `images/${directionData.eyes}`;
  }
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
  incrementHotdogCounter();

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

// Load hotdog counter from database
async function loadHotdogCounter(): Promise<void> {
  try {
    if (gameState.supabase) {
      const { data, error } = await gameState.supabase
        .from('hotdog_counter')
        .select('count')
        .single();

      if (error) {
        console.error('Error loading counter:', error);
        // Fallback to localStorage
        gameState.currentHotdogCount = parseInt(
          localStorage.getItem('hotdogCount') || '0'
        );
      } else {
        const counterData = data as HotdogCounterRow;
        gameState.currentHotdogCount = counterData.count || 0;
      }
    } else {
      // Using localStorage fallback
      gameState.currentHotdogCount = parseInt(
        localStorage.getItem('hotdogCount') || '0'
      );
    }

    updateCounterDisplay();
  } catch (error) {
    console.error('Error loading counter:', error);
    gameState.currentHotdogCount = parseInt(
      localStorage.getItem('hotdogCount') || '0'
    );
    updateCounterDisplay();
  }
}

// Increment hotdog counter
async function incrementHotdogCounter(): Promise<void> {
  gameState.currentHotdogCount++;
  updateCounterDisplay();

  try {
    if (gameState.supabase) {
      const { error } = await gameState.supabase
        .from('hotdog_counter')
        .update({
          count: gameState.currentHotdogCount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1);

      if (error) {
        console.error('Error updating counter:', error);
        // Save to localStorage as backup
        localStorage.setItem(
          'hotdogCount',
          gameState.currentHotdogCount.toString()
        );
      }
    } else {
      // Using localStorage fallback
      localStorage.setItem(
        'hotdogCount',
        gameState.currentHotdogCount.toString()
      );
    }
  } catch (error) {
    console.error('Error updating counter:', error);
    // Save to localStorage as backup
    localStorage.setItem(
      'hotdogCount',
      gameState.currentHotdogCount.toString()
    );
  }
}

// Update counter display
function updateCounterDisplay(): void {
  const counterElement = document.getElementById(
    'hotdog-counter'
  ) as HTMLElement;
  if (!counterElement) {
    console.error('Counter element not found');
    return;
  }

  counterElement.textContent = gameState.currentHotdogCount.toLocaleString();
  counterElement.classList.remove('loading');
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

const template = html`
  <img src="./img/bg.png" alt="Space Background" id="bg" />
  <glizzy-counter></glizzy-counter>

  <!-- Cat Container -->
  <div id="cat-container">
    <img
      src="images/cat_body.png"
      alt="Cat Body"
      id="cat-body"
      draggable="false"
    />

    <div id="cat-head">
      <!-- Cat Eyes (will change based on cursor direction) -->
      <img
        src="images/cat_eyes_left.png"
        alt="Cat Eyes"
        id="cat-eyes"
        draggable="false"
      />

      <!-- Cat Face (will change based on cursor direction) -->
      <img
        src="images/cat_face_left.png"
        alt="Cat Face"
        id="cat-face"
        draggable="false"
      />

      <!-- Cat Mouth Area (drop zone) -->
      <div id="cat-mouth"></div>
    </div>
  </div>

  <!-- Hotdog Pile -->
  <div id="hotdog-pile">
    <!-- Hotdogs will be dynamically added here -->
  </div>

  <!-- Drop feedback -->
  <div id="drop-feedback"></div>
</div>`;

const styles = css`
  :host {
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

  /* Cat Container */
  #cat-container {
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

  /* Hotdog Pile */
  #hotdog-pile {
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

  /* Drop Feedback */
  #drop-feedback {
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

  #drop-feedback.show {
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

@customElement({ name: 'cat-glizzier', template, styles })
export class CatGlizzier extends FASTElement {
  // Component logic goes here
}
