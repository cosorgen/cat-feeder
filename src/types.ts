// Type definitions for the cat feeder game

export interface SupabaseConfig {
  url: string;
  key: string;
}

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

// Extend the Window interface to include Supabase
declare global {
  interface Window {
    supabase: {
      createClient: (url: string, key: string) => any;
    };
  }

  // Global configuration
  const SUPABASE_CONFIG: SupabaseConfig;
}
