import { useState, useEffect } from "react";

interface CrossfaderState {
  value: number;
  showLeftDeck: boolean;
  showRightDeck: boolean;
  isConnected: boolean;
}

interface CrossfaderMessage {
  crossfader: number;
}

export function useCrossfader(): CrossfaderState {
  const [state, setState] = useState<CrossfaderState>({
    value: 50,
    showLeftDeck: true,
    showRightDeck: true,
    isConnected: false,
  });

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;
    let isUnmounted = false;

    const connectWebSocket = () => {
      if (isUnmounted) return;

      ws = new WebSocket("ws://localhost:8765");

      ws.onopen = () => {
        if (!isUnmounted) {
          setState((prev) => ({ ...prev, isConnected: true }));
        }
      };

      ws.onmessage = (event) => {
        if (isUnmounted) return;

        try {
          const data = JSON.parse(event.data) as CrossfaderMessage;

          // Ensure crossfader value is between 0 and 100
          const crossfaderValue = Math.max(0, Math.min(100, data.crossfader));

          setState({
            value: crossfaderValue,
            showLeftDeck: crossfaderValue <= 60,
            showRightDeck: crossfaderValue >= 40,
            isConnected: true,
          });
        } catch (error) {
          console.error("Failed to parse crossfader message:", error);
        }
      };

      ws.onerror = (error) => {
        if (!isUnmounted) {
          console.error("Crossfader WebSocket error:", error);
          setState((prev) => ({ ...prev, isConnected: false }));
        }
      };

      ws.onclose = () => {
        if (!isUnmounted) {
          setState((prev) => ({ ...prev, isConnected: false }));
          reconnectTimeout = setTimeout(connectWebSocket, 3000);
        }
      };
    };

    connectWebSocket();

    // Cleanup function
    return () => {
      isUnmounted = true;
      if (ws) {
        ws.close();
      }
      clearTimeout(reconnectTimeout);
    };
  }, []);

  return state;
}
