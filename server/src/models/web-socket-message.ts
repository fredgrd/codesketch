export interface WebSocketMessage {
  action: string;
  payload: WebSocketMessagePayload;
}

type WebSocketMessagePayload = WSMovePayload | WSDrawPayload | undefined;

export interface WSMovePayload {
  x: number;
  y: number;
}

export interface WSDrawPayload {
  start: {
    x: number;
    y: number;
  };
  end: {
    x: number;
    y: number;
  };
}
