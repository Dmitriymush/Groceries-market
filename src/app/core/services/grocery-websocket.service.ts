import { Injectable, signal, OnDestroy } from '@angular/core';
import { Subject, Subscription, timer } from 'rxjs';
import { WsConnectionStatus, WsEventType, WsGroceryEvent } from '@core/models/websocket.model';

const SIMULATED_NAMES = ['Bananas', 'Cheese', 'Bread', 'Yogurt', 'Rice', 'Chicken', 'Tomatoes', 'Pasta'];
const SIMULATED_USERS = ['Anna', 'Max', 'Sofia'];
const EVENT_INTERVAL_MS = 20_000;

@Injectable({ providedIn: 'root' })
export class GroceryWebSocketService implements OnDestroy {
  private readonly _connectionStatus = signal<WsConnectionStatus>('disconnected');
  private readonly _events$ = new Subject<WsGroceryEvent>();
  private simulationSub: Subscription | null = null;
  private reconnectSub: Subscription | null = null;

  readonly connectionStatus = this._connectionStatus.asReadonly();
  readonly events$ = this._events$.asObservable();

  connect(): void {
    if (this._connectionStatus() === 'connected') return;

    this._connectionStatus.set('reconnecting');

    this.reconnectSub = timer(1_500).subscribe(() => {
      this._connectionStatus.set('connected');
      this.startSimulation();
    });
  }

  disconnect(): void {
    this.stopSimulation();
    this.reconnectSub?.unsubscribe();
    this.reconnectSub = null;
    this._connectionStatus.set('disconnected');
  }

  ngOnDestroy(): void {
    this.disconnect();
    this._events$.complete();
  }

  private startSimulation(): void {
    this.stopSimulation();

    this.simulationSub = timer(EVENT_INTERVAL_MS, EVENT_INTERVAL_MS).subscribe(() => {
      const event = this.generateRandomEvent();
      this._events$.next(event);
    });
  }

  private stopSimulation(): void {
    this.simulationSub?.unsubscribe();
    this.simulationSub = null;
  }

  private generateRandomEvent(): WsGroceryEvent {
    const types: WsEventType[] = ['item_added', 'item_updated', 'item_deleted', 'item_toggled'];
    const type = types[Math.floor(Math.random() * types.length)];
    const itemName = SIMULATED_NAMES[Math.floor(Math.random() * SIMULATED_NAMES.length)];
    const username = SIMULATED_USERS[Math.floor(Math.random() * SIMULATED_USERS.length)];

    return {
      type,
      payload: {
        itemId: Math.floor(Math.random() * 1000) + 100,
        itemName,
        username,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
