/**
 * Event bus for inter-component communication
 */

// Type-safe event callback
type EventCallback = (...args: unknown[]) => void;

export declare class EventBus {
  private static instance;
  private listeners;
  private constructor();
  static getInstance(): EventBus;
  /**
   * Subscribe to an event
   */
  on(event: string, callback: EventCallback): () => void;
  /**
   * Subscribe to an event (one-time only)
   */
  once(event: string, callback: EventCallback): void;
  /**
   * Unsubscribe from an event
   */
  off(event: string, callback: EventCallback): void;
  /**
   * Emit an event
   */
  emit(event: string, ...args: unknown[]): void;
  /**
   * Clear all listeners for an event or all events
   */
  clear(event?: string): void;
}
//# sourceMappingURL=event-bus.d.ts.map
