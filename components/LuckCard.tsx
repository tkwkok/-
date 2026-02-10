import React from 'react';
import { FortuneResult } from '../types';

interface Props {
  fortune: FortuneResult;
}

const LuckCard: React.FC<Props> = ({ fortune }) => {
  const getStatusStyle = () => {
    switch(fortune.status) {
      case 'good': return { 
        accent: '#1e40af', // 진한 파랑
        text: 'text-brand-blue',
        bg: 'bg-blue-50/70',
        border: 'border-blue-200',
        dot: 'bg-brand-blue'
      };
      case 'bad': return { 
        accent: '#991b1b', // 짙은 빨강
        text: 'text-brand-red',
        bg: 'bg-red-50/70',
        border: 'border-red-200',
        dot: 'bg-brand-red'
      };
      default: return { 
        accent: '#3f3f46', 
        text: 'text-zinc-700',
        bg: 'bg-stone-50',
        border: 'border-stone-200',
        dot: 'bg-zinc-400'
      };
    }
  };

  const style = getStatusStyle();

  return (
    <div className={`premium-oriental-card p-10 relative overflow-hidden transition-all duration-500 hover:shadow-2xl bg-white border-l-[20px] shadow-sm`} 
         style={{ borderColor: style.accent }}>
      
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${style.dot} ${fortune.status !== 'neutral' ? 'animate-pulse' : ''}`}></div>
            <span className={`text-[12px] font-black uppercase tracking-[0.3em] ${style.text}`}>
              {fortune.title}
            </span>
          </div>
          <h4 className={`text-4xl font-black ${style.text} tracking-tighter pt-1`}>
            {fortune.name}
          </h4>
        </div>
        <div className="text-right select-none pointer-events-none opacity-[0.04]">
          <div className="text-8xl font-black text-brand-ink italic">卦</div>
        </div>
      </div>
      
      <div className={`p-8 rounded-[2rem] ${style.bg} mb-8 border ${style.border} backdrop-blur-sm`}>
        <p className="text-[17px] text-stone-800 leading-relaxed font-bold whitespace-pre-wrap">
          {fortune.description}
        </p>
      </div>
      
      <div className="flex justify-between items-center pt-6 border-t border-stone-100">
        <span className="text-[10px] text-stone-400 font-black uppercase tracking-widest italic">Ancient I-Ching Oracle</span>
        <span className={`text-[11px] font-black tracking-widest uppercase ${style.text}`}>
          {fortune.status === 'good' ? 'Great Fortune' : fortune.status === 'bad' ? 'Calamity Alert' : 'Natural Flow'}
        </span>
      </div>
    </div>
  );
};

export default LuckCard;