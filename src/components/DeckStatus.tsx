import type { DeckStatus } from "../types/deck";
import { useEffect, useState } from "react";
import "./DeckStatus.css";

interface DeckStatusProps {
  deckStatuses: Record<number, DeckStatus>;
  onBpmChange?: (bpm: number) => void;
}

export function DeckStatusDisplay({
  deckStatuses,
  onBpmChange,
}: DeckStatusProps) {
  const [deck1State, setDeck1State] = useState({
    animate: false,
    fading: false,
    content: null as (typeof deckStatuses)[1] | null,
  });
  const [deck2State, setDeck2State] = useState({
    animate: false,
    fading: false,
    content: null as (typeof deckStatuses)[2] | null,
  });

  const deck1 = deckStatuses[1];
  const deck2 = deckStatuses[2];

  // Get visibility from deckStatuses
  const deck1Visible = Boolean(deckStatuses[1]);
  const deck2Visible = Boolean(deckStatuses[2]);

  // Handle Deck 1 updates
  useEffect(() => {
    if (deck1?.track.title !== deck1State.content?.track.title) {
      // Start fade out
      setDeck1State((prev) => ({ ...prev, fading: true }));

      // After fade out, update content and start fade in
      const timeout = setTimeout(() => {
        setDeck1State({
          animate: true,
          fading: false,
          content: deck1,
        });
      }, 300); // Match the fadeOut animation duration

      return () => clearTimeout(timeout);
    }
  }, [deck1?.track.title]);

  // Handle Deck 2 updates
  useEffect(() => {
    if (deck2?.track.title !== deck2State.content?.track.title) {
      setDeck2State((prev) => ({ ...prev, fading: true }));

      const timeout = setTimeout(() => {
        setDeck2State({
          animate: true,
          fading: false,
          content: deck2,
        });
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [deck2?.track.title]);

  const handleAnimationEnd = (deck: number) => {
    if (deck === 1) {
      setDeck1State((prev) => ({ ...prev, animate: false }));
    }
    if (deck === 2) {
      setDeck2State((prev) => ({ ...prev, animate: false }));
    }
  };

  return (
    <div className="split-container">
      <div className="diagonal-divider" />

      {/* Left Deck */}
      <div
        className={`deck-side left ${deck1?.status.toLowerCase() || "empty"} ${
          !deck1Visible ? "hidden" : ""
        }`}
      >
        <div
          className={`deck-content ${deck1State.fading ? "fade-out" : ""} ${
            deck1State.animate ? "fade-in" : ""
          }`}
          onAnimationEnd={() => handleAnimationEnd(1)}
          style={
            deck1
              ? ({
                  "--pulse-duration": `${60000 / deck1.track.bpm}ms`,
                } as React.CSSProperties)
              : undefined
          }
        >
          {deck1State.content ? (
            <>
              <div className="track-title">
                {deck1State.content.track.title}
              </div>
              <div className="track-details">
                <div className="track-artist">
                  {deck1State.content.track.artist}
                </div>
                <div className="track-bpm">
                  {deck1State.content.track.bpm} BPM
                </div>
                <div className="deck-status-indicator">
                  Deck 1 • {deck1State.content.status}
                </div>
              </div>
            </>
          ) : (
            <div className="empty-message">No Track on Deck 1</div>
          )}
        </div>
      </div>

      {/* Right Deck */}
      <div
        className={`deck-side right ${deck2?.status.toLowerCase() || "empty"} ${
          !deck2Visible ? "hidden" : ""
        }`}
      >
        <div
          className={`deck-content ${deck2State.fading ? "fade-out" : ""} ${
            deck2State.animate ? "fade-in" : ""
          }`}
          onAnimationEnd={() => handleAnimationEnd(2)}
          style={
            deck2
              ? ({
                  "--pulse-duration": `${60000 / deck2.track.bpm}ms`,
                } as React.CSSProperties)
              : undefined
          }
        >
          {deck2State.content ? (
            <>
              <div className="track-details">
                <div className="deck-status-indicator">
                  Deck 2 • {deck2State.content.status}
                </div>
                <div className="track-bpm">
                  {deck2State.content.track.bpm} BPM
                </div>
                <div className="track-artist">
                  {deck2State.content.track.artist}
                </div>
              </div>
              <div className="track-title">
                {deck2State.content.track.title}
              </div>
            </>
          ) : (
            <div className="empty-message">No Track on Deck 2</div>
          )}
        </div>
      </div>
    </div>
  );
}
