export interface Track {
  title: string;
  artist: string;
  bpm: number;
}

export interface DeckStatus {
  status: "STARTED" | "STOPPED";
  deck: number;
  volume: number;
  track: Track;
}
