import { SupabaseClient, createClient } from '@supabase/supabase-js';
import type { HotdogCounterRow, DropZone } from './types.js';
import { observable } from '@microsoft/fast-element';
import { RandomGlizzy } from './random-glizzy.js';

export default class GlizzyState {
  @observable glizziesGuzzled = 0;
  @observable isDragging = false;
  @observable showFeedback = false;
  supabase?: SupabaseClient;
  draggedElement?: RandomGlizzy;
  catMouth?: HTMLElement;

  constructor() {
    this.initializeSupabase();
    this.loadGlizzyCount();

    window.addEventListener('mousemove', this.handleDrag);
    window.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('contextmenu', (e: Event) => e.preventDefault());
  }

  initializeSupabase() {
    if (
      import.meta.env.VITE_SUPABASE_URL &&
      import.meta.env.VITE_SUPABASE_ANON_KEY
    ) {
      this.supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );
    } else {
      console.warn('Supabase configuration not set. Using local counter.');
    }
  }

  async loadGlizzyCount() {
    if (this.supabase) {
      const { error, data } = await this.supabase
        .from('hotdog_counter')
        .select('count')
        .single();

      if (error) {
        console.error('Error loading counter:', error);
      } else {
        this.glizziesGuzzled = (data as HotdogCounterRow).count || 0;
      }
    } else {
      this.initializeSupabase();
    }
  }

  async incrementGlizzyCount() {
    this.glizziesGuzzled += 1;

    if (this.supabase) {
      const { error } = await this.supabase
        .from('hotdog_counter')
        .update({
          count: this.glizziesGuzzled,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1);

      if (error) {
        console.error('Error updating counter:', error);
        // Save to localStorage as backup
        localStorage.setItem('hotdogCount', this.glizziesGuzzled.toString());
      }
    }
  }

  glizzyStartDrag(el: RandomGlizzy, clientX: number, clientY: number): void {
    if (this.isDragging) return;

    this.draggedElement = el;
    el.dragging = true;
    this.isDragging = true;
    this.draggedElement = el;

    // Store offset for smooth dragging
    const rect = el.getBoundingClientRect();
    el.dataset.offsetX = (clientX - rect.left).toString();
    el.dataset.offsetY = (clientY - rect.top).toString();
    el.dataset.position = el.style.position;
    el.dataset.left = el.style.left;
    el.dataset.top = el.style.top;
    el.dataset.zIndex = el.style.zIndex;
  }

  // Mouse move handler for dragging
  handleDrag = (e: MouseEvent): void => {
    if (this.isDragging) {
      const offsetX = parseInt(this.draggedElement?.dataset.offsetX || '0');
      const offsetY = parseInt(this.draggedElement?.dataset.offsetY || '0');

      this.draggedElement!.style.position = 'fixed';
      this.draggedElement!.style.left = e.clientX - offsetX + 'px';
      this.draggedElement!.style.top = e.clientY - offsetY + 'px';
      this.draggedElement!.style.zIndex = '1000';

      // Check if over cat mouth
      this.checkDropZone(e.clientX, e.clientY);
    }
  };

  handleMouseUp = (e: MouseEvent): void => {
    if (this.isDragging) {
      const dropSuccess = this.checkDropZone(e.clientX, e.clientY, true);

      if (dropSuccess) {
        // TODO: add new hotdog to pile
        this.showFeedback = true;
        setTimeout(() => {
          this.showFeedback = false;
        }, 1000);
        this.draggedElement!.eaten = dropSuccess;
        this.incrementGlizzyCount();
        this.catMouth?.classList.remove('drop-zone-active');
      } else {
        // Reset hotdog
        this.draggedElement!.style.position =
          this.draggedElement!.dataset.position || 'absolute';
        this.draggedElement!.style.left =
          this.draggedElement!.dataset.left || 'auto';
        this.draggedElement!.style.top =
          this.draggedElement!.dataset.top || 'auto';
        this.draggedElement!.style.zIndex =
          this.draggedElement!.dataset.zIndex || '1';
      }

      this.isDragging = false;
      this.draggedElement!.dragging = false;
      this.draggedElement = undefined;
    }
  };

  checkDropZone(x: number, y: number, _isDrop: boolean = false): boolean {
    if (!this.catMouth) {
      console.error('Cat mouth element not found');
      return false;
    }

    const mouthRect = this.catMouth.getBoundingClientRect();

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
      this.catMouth.classList.add('drop-zone-active');
    } else {
      this.catMouth.classList.remove('drop-zone-active');
    }

    return isInZone;
  }
}
