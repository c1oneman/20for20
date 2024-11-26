export interface TrackStatus {
  status: "STARTED" | "STOPPED";
  deck: 1 | 2;
  volume: number;
  track: {
    title: string;
    artist: string;
    bpm: number;
  };
}
