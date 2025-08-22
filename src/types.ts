// Type definitions for the cat feeder game

export interface DirectionMapping {
  face: string;
  eyes: string;
}

export interface Directions {
  up: DirectionMapping;
  down: DirectionMapping;
  left: DirectionMapping;
  right: DirectionMapping;
}

export type CatDirection = keyof Directions;

export interface HotdogCounterRow {
  id: number;
  count: number;
  updated_at: string;
}

export interface GameState {
  supabase: any | null;
  currentHotdogCount: number;
  catDirection: CatDirection;
  isDragging: boolean;
  draggedElement: HTMLImageElement | null;
  hotdogPileCount: number;
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
