export interface HotdogCounterRow {
  id: number;
  count: number;
  updated_at: string;
}

export interface DragOffset {
  x: number;
  y: number;
}

export interface DropZone {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

// Extend window to include gameState
declare global {
  interface Window {
    dragging?: boolean;
    draggedElement?: HTMLElement;
  }
}
