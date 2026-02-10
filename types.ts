
export interface HanjaItem {
  h: string;
  k: string;
  s: number;
}

export interface FortuneResult {
  title: string;
  upper: number;
  lower: number;
  code: string;
  name: string;
  description: string;
  status: 'good' | 'bad' | 'neutral';
}

export enum AnalysisMode {
  HANGUL = 'HANGUL',
  HANJA = 'HANJA'
}
