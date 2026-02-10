
export interface FortuneResult {
  category: '수리' | '오행' | '음양' | '종합';
  title: string;
  name: string;
  description: string;
  status: 'good' | 'bad' | 'neutral';
  tags?: string[];
}

// Fixed missing HanjaItem interface for constants.tsx
export interface HanjaItem {
  h: string; // Hanja character
  k: string; // Korean reading
  s: number; // Stroke count
}
