export type TimeRange = [number, number];
export interface EgmSample {
  Time: number;
  [key: string]: number | null;
}
export type TimeRangePosition = "start" | "middle" | "end";

export type Egm = EgmSample[];
