import { Injectable, signal, NgZone, inject, OnDestroy } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConnectivityService implements OnDestroy {
  private zone = inject(NgZone);
  private readonly _isOnline = signal<boolean>(navigator.onLine);

  readonly isOnline = this._isOnline.asReadonly();

  private onlineHandler = (): void => this.zone.run(() => this._isOnline.set(true));
  private offlineHandler = (): void => this.zone.run(() => this._isOnline.set(false));

  constructor() {
    window.addEventListener('online', this.onlineHandler);
    window.addEventListener('offline', this.offlineHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('online', this.onlineHandler);
    window.removeEventListener('offline', this.offlineHandler);
  }
}
