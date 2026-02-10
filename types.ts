
export interface HanjaItem {
  h: string;
  k: string;
  s: number;
}

export interface FortuneResult {
  category: '수리' | '오행' | '음양' | '종합';
  title: string;
  name: string;
  description: string;
  status: 'good' | 'bad' | 'neutral';
  tags?: string[];
}

export enum AnalysisMode {
  HANGUL = 'HANGUL',
  HANJA = 'HANJA'
}
