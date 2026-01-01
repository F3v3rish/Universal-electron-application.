/**
 * Event bus for inter-component communication
 */
export declare class EventBus {
    private static instance;
    private listeners;
    private constructor();
    static getInstance(): EventBus;
    /**
     * Subscribe to an event
     */
    on(event: string, callback: Function): () => void;
    /**
     * Subscribe to an event (one-time only)
     */
    once(event: string, callback: Function): void;
    /**
     * Unsubscribe from an event
     */
    off(event: string, callback: Function): void;
    /**
     * Emit an event
     */
    emit(event: string, ...args: any[]): void;
    /**
     * Clear all listeners for an event or all events
     */
    clear(event?: string): void;
}
//# sourceMappingURL=event-bus.d.ts.map