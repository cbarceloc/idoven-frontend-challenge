export interface EgmSample {
  Time: number;
  [key: string]: number | null;
}

export type Egm = EgmSample[];
