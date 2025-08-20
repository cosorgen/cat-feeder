// Game State
let supabase = null;
let currentHotdogCount = 0;
let catDirection = 'up';
let isDragging = false;
let draggedElement = null;
let hotdogPileCount = 3; // Number of hotdogs in the pile

// Direction mappings for cat face and eyes
const directions = {
  up: { face: 'cat_face_up.png', eyes: 'cat_eyes_up.png' },
  down: { face: 'cat_face_down.png', eyes: 'cat_eyes_down.png' },
  left: { face: 'cat_face_left.png', eyes: 'cat_eyes_left.png' },
  right: { face: 'cat_face_right.png', eyes: 'cat_eyes_right.png' },
};

// Initialize the game
document.addEventListener('DOMContentLoaded', function () {
  initializeSupabase();
  initializeGame();
  setupEventListeners();
  createCustomCursor();
  createHotdogPile();
  loadHotdogCounter();
});

// Initialize Supabase connection
function initializeSupabase() {
  try {
    if (
      SUPABASE_CONFIG.url &&
      SUPABASE_CONFIG.key &&
      SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL' &&
      SUPABASE_CONFIG.key !== 'YOUR_SUPABASE_ANON_KEY'
    ) {
      supabase = window.supabase.createClient(
        SUPABASE_CONFIG.url,
        SUPABASE_CONFIG.key
      );
      console.log('Supabase initialized successfully');
    } else {
      console.warn('Supabase configuration not set. Using local counter.');
      // Use localStorage as fallback
      currentHotdogCount = parseInt(localStorage.getItem('hotdogCount') || '0');
      updateCounterDisplay();
    }
  } catch (error) {
    console.error('Error initializing Supabase:', error);
    // Fallback to localStorage
    currentHotdogCount = parseInt(localStorage.getItem('hotdogCount') || '0');
    updateCounterDisplay();
  }
}

// Initialize game elements
function initializeGame() {
  const catFace = document.getElementById('cat-face');
  const catEyes = document.getElementById('cat-eyes');

  // Set initial cat direction
  updateCatDirection('up');
}

// Setup event listeners
function setupEventListeners() {
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
  document.addEventListener('contextmenu', (e) => e.preventDefault());
}

// Create custom cursor
function createCustomCursor() {
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  document.body.appendChild(cursor);

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });
}

// Handle mouse movement for cat tracking
function handleMouseMove(e) {
  if (!isDragging) {
    updateCatDirection(getCursorDirection(e.clientX, e.clientY));
  }

  // Update custom cursor position
  const cursor = document.querySelector('.custom-cursor');
  if (cursor) {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  }
}

// Handle touch movement for cat tracking
function handleTouchMove(e) {
  if (e.touches.length > 0 && !isDragging) {
    const touch = e.touches[0];
    updateCatDirection(getCursorDirection(touch.clientX, touch.clientY));
  }
}

// Calculate cursor direction relative to cat
function getCursorDirection(x, y) {
  const catContainer = document.querySelector('.cat-container');
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
function updateCatDirection(direction) {
  if (direction === catDirection) return;

  catDirection = direction;
  const catFace = document.getElementById('cat-face');
  const catEyes = document.getElementById('cat-eyes');

  if (directions[direction]) {
    catFace.src = `images/${directions[direction].face}`;
    catEyes.src = `images/${directions[direction].eyes}`;
  }
}

// Create hotdog pile
function createHotdogPile() {
  const pile = document.getElementById('hotdog-pile');
  const hotdogImages = ['glizzy_1.png', 'glizzy_2.png', 'glizzy_3.png'];

  for (let i = 0; i < hotdogPileCount; i++) {
    const hotdog = document.createElement('img');
    const randomImage =
      hotdogImages[Math.floor(Math.random() * hotdogImages.length)];
    hotdog.src = `images/${randomImage}`;
    hotdog.className = 'hotdog';
    hotdog.draggable = false; // We'll handle dragging manually
    hotdog.dataset.hotdogId = i;
    pile.appendChild(hotdog);
  }
}

// Mouse down handler for drag start
function handleMouseDown(e) {
  if (
    e.target.classList.contains('hotdog') &&
    !e.target.classList.contains('eaten')
  ) {
    isDragging = true;
    draggedElement = e.target;
    draggedElement.classList.add('dragging');

    // Store offset for smooth dragging
    const rect = draggedElement.getBoundingClientRect();
    draggedElement.dataset.offsetX = e.clientX - rect.left;
    draggedElement.dataset.offsetY = e.clientY - rect.top;

    e.preventDefault();
  }
}

// Mouse move handler for dragging
function handleDrag(e) {
  if (isDragging && draggedElement) {
    const offsetX = parseInt(draggedElement.dataset.offsetX);
    const offsetY = parseInt(draggedElement.dataset.offsetY);

    draggedElement.style.position = 'fixed';
    draggedElement.style.left = e.clientX - offsetX + 'px';
    draggedElement.style.top = e.clientY - offsetY + 'px';
    draggedElement.style.zIndex = '1000';

    // Check if over cat mouth
    checkDropZone(e.clientX, e.clientY);
  }
}

// Mouse up handler for drop
function handleMouseUp(e) {
  if (isDragging && draggedElement) {
    const dropSuccess = checkDropZone(e.clientX, e.clientY, true);

    if (dropSuccess) {
      feedCat(draggedElement);
    } else {
      // Return hotdog to pile
      returnHotdogToPile(draggedElement);
    }

    cleanupDrag();
  }
}

// Touch event handlers
function handleTouchStart(e) {
  if (
    e.target.classList.contains('hotdog') &&
    !e.target.classList.contains('eaten')
  ) {
    const touch = e.touches[0];
    isDragging = true;
    draggedElement = e.target;
    draggedElement.classList.add('dragging');

    const rect = draggedElement.getBoundingClientRect();
    draggedElement.dataset.offsetX = touch.clientX - rect.left;
    draggedElement.dataset.offsetY = touch.clientY - rect.top;

    e.preventDefault();
  }
}

function handleTouchDrag(e) {
  if (isDragging && draggedElement && e.touches.length > 0) {
    const touch = e.touches[0];
    const offsetX = parseInt(draggedElement.dataset.offsetX);
    const offsetY = parseInt(draggedElement.dataset.offsetY);

    draggedElement.style.position = 'fixed';
    draggedElement.style.left = touch.clientX - offsetX + 'px';
    draggedElement.style.top = touch.clientY - offsetY + 'px';
    draggedElement.style.zIndex = '1000';

    checkDropZone(touch.clientX, touch.clientY);
    e.preventDefault();
  }
}

function handleTouchEnd(e) {
  if (isDragging && draggedElement) {
    const touch = e.changedTouches[0];
    const dropSuccess = checkDropZone(touch.clientX, touch.clientY, true);

    if (dropSuccess) {
      feedCat(draggedElement);
    } else {
      returnHotdogToPile(draggedElement);
    }

    cleanupDrag();
  }
}

// Check if hotdog is over cat mouth
function checkDropZone(x, y, isDrop = false) {
  const catMouth = document.getElementById('cat-mouth');
  const mouthRect = catMouth.getBoundingClientRect();

  // Expand the drop zone slightly for better UX
  const expandedZone = {
    left: mouthRect.left - 30,
    right: mouthRect.right + 30,
    top: mouthRect.top - 30,
    bottom: mouthRect.bottom + 30,
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
function feedCat(hotdogElement) {
  // Play eat animation
  hotdogElement.classList.add('eaten');

  // Show feedback
  showDropFeedback('Nom nom! 🐱');

  // Update counter
  incrementHotdogCounter();

  // Remove hotdog after animation
  setTimeout(() => {
    hotdogElement.remove();
    // Add a new hotdog to the pile
    addNewHotdogToPile();
  }, 500);

  // Remove drop zone highlight
  document.getElementById('cat-mouth').classList.remove('drop-zone-active');
}

// Return hotdog to pile (failed drop)
function returnHotdogToPile(hotdogElement) {
  hotdogElement.style.position = 'static';
  hotdogElement.style.left = 'auto';
  hotdogElement.style.top = 'auto';
  hotdogElement.style.zIndex = 'auto';

  // Add back to pile if it was removed
  const pile = document.getElementById('hotdog-pile');
  if (!pile.contains(hotdogElement)) {
    pile.appendChild(hotdogElement);
  }
}

// Add new hotdog to pile
function addNewHotdogToPile() {
  const pile = document.getElementById('hotdog-pile');
  const hotdogImages = ['glizzy_1.png', 'glizzy_2.png', 'glizzy_3.png'];

  const hotdog = document.createElement('img');
  const randomImage =
    hotdogImages[Math.floor(Math.random() * hotdogImages.length)];
  hotdog.src = `images/${randomImage}`;
  hotdog.className = 'hotdog';
  hotdog.draggable = false;
  hotdog.dataset.hotdogId = Date.now(); // Unique ID

  // Add with a small delay for smooth appearance
  setTimeout(() => {
    pile.appendChild(hotdog);
  }, 200);
}

// Cleanup drag state
function cleanupDrag() {
  if (draggedElement) {
    draggedElement.classList.remove('dragging');
    draggedElement = null;
  }
  isDragging = false;
  document.getElementById('cat-mouth').classList.remove('drop-zone-active');
}

// Show drop feedback
function showDropFeedback(message) {
  const feedback = document.getElementById('drop-feedback');
  feedback.textContent = message;
  feedback.classList.add('show');

  setTimeout(() => {
    feedback.classList.remove('show');
  }, 600);
}

// Load hotdog counter from database
async function loadHotdogCounter() {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('hotdog_counter')
        .select('count')
        .single();

      if (error) {
        console.error('Error loading counter:', error);
        // Fallback to localStorage
        currentHotdogCount = parseInt(
          localStorage.getItem('hotdogCount') || '0'
        );
      } else {
        currentHotdogCount = data.count || 0;
      }
    } else {
      // Using localStorage fallback
      currentHotdogCount = parseInt(localStorage.getItem('hotdogCount') || '0');
    }

    updateCounterDisplay();
  } catch (error) {
    console.error('Error loading counter:', error);
    currentHotdogCount = parseInt(localStorage.getItem('hotdogCount') || '0');
    updateCounterDisplay();
  }
}

// Increment hotdog counter
async function incrementHotdogCounter() {
  currentHotdogCount++;
  updateCounterDisplay();

  try {
    if (supabase) {
      const { error } = await supabase
        .from('hotdog_counter')
        .update({
          count: currentHotdogCount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1);

      if (error) {
        console.error('Error updating counter:', error);
        // Save to localStorage as backup
        localStorage.setItem('hotdogCount', currentHotdogCount.toString());
      }
    } else {
      // Using localStorage fallback
      localStorage.setItem('hotdogCount', currentHotdogCount.toString());
    }
  } catch (error) {
    console.error('Error updating counter:', error);
    // Save to localStorage as backup
    localStorage.setItem('hotdogCount', currentHotdogCount.toString());
  }
}

// Update counter display
function updateCounterDisplay() {
  const counterElement = document.getElementById('hotdog-counter');
  counterElement.textContent = currentHotdogCount.toLocaleString();
  counterElement.classList.remove('loading');
}

// Utility function to get random hotdog image
function getRandomHotdogImage() {
  const images = ['glizzy_1.png', 'glizzy_2.png', 'glizzy_3.png'];
  return images[Math.floor(Math.random() * images.length)];
}

// Handle window resize
window.addEventListener('resize', () => {
  if (isDragging) {
    cleanupDrag();
  }
});

// Handle visibility change (tab switching)
document.addEventListener('visibilitychange', () => {
  if (document.hidden && isDragging) {
    cleanupDrag();
  }
});
