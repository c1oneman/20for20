import { useState, useEffect } from "react";
import { TrackStatus } from "../types/tracks";

export function useTrackStatus() {
  const [deck1Status, setDeck1Status] = useState<TrackStatus | null>(null);
  const [deck2Status, setDeck2Status] = useState<TrackStatus | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/track-status");

    ws.onmessage = (event) => {
      const data: TrackStatus = JSON.parse(event.data);
      if (data.deck === 1) {
        setDeck1Status(data.status === "STOPPED" ? null : data);
      } else {
        setDeck2Status(data.status === "STOPPED" ? null : data);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, []);

  return { deck1Status, deck2Status };
}
