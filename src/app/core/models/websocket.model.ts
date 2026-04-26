export type WsEventType = 'item_added' | 'item_updated' | 'item_deleted' | 'item_toggled';

export type WsConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

export interface WsGroceryEvent {
  type: WsEventType;
  payload: {
    itemId: number;
    itemName: string;
    username: string;
  };
  timestamp: string;
}
