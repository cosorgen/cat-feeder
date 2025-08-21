import { SupabaseClient, createClient } from '@supabase/supabase-js';
import type { HotdogCounterRow } from './types.js';
import { observable } from '@microsoft/fast-element';

export default class GlizzyState {
  @observable glizziesGluzzled = 0;
  supabase?: SupabaseClient;
  isDragging = false;

  constructor() {
    this.initializeSupabase();
    this.loadGlizzyCount();
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
        this.glizziesGluzzled = (data as HotdogCounterRow).count || 0;
      }
    } else {
      this.initializeSupabase();
    }
  }

  async incrementGlizzyCount() {
    this.glizziesGluzzled += 1;

    if (this.supabase) {
      const { error } = await this.supabase
        .from('hotdog_counter')
        .update({
          count: this.glizziesGluzzled,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1);

      if (error) {
        console.error('Error updating counter:', error);
        // Save to localStorage as backup
        localStorage.setItem('hotdogCount', this.glizziesGluzzled.toString());
      }
    }
  }
}
