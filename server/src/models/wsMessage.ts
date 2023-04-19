export interface WSMessage {
  action: string;
  payload: WSMessageActionPayloadMove | WSMessageActionPayloadDraw;
}

export interface WSMessageActionPayloadMove {
  x: string;
  y: string;
}

export interface WSMessageActionPayloadDraw {
  start: {
    x: string;
    y: string;
  };
  end: {
    x: string;
    y: string;
  };
}
