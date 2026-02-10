import React from 'react';
import { FortuneResult } from '../types';

interface Props {
  fortune: FortuneResult;
}

const LuckCard: React.FC<Props> = ({ fortune }) => {
  const getStatusStyle = () => {
    switch(fortune.status) {
      case 'good': return { 
        accent: '#4a1c22', 
        label: 'bg-brand-red', 
        text: 'text-brand-red',
        bg: 'bg-brand-red/5',
        border: 'border-brand-red'
      };
      case 'bad': return { 
        accent: '#71717a', 
        label: 'bg-zinc-500', 
        text: 'text-zinc-600',
        bg: 'bg-zinc-50',
        border: 'border-zinc-400'
      };
      default: return { 
        accent: '#c5a059', 
        label: 'bg-brand-gold', 
        text: 'text-brand-gold',
        bg: 'bg-brand-gold/5',
        border: 'border-brand-gold'
      };
    }
  };

  const style = getStatusStyle();

  return (
    <div className={`premium-oriental-card p-10 relative overflow-hidden transition-all duration-500 hover:shadow-2xl`} 
         style={{ borderLeft: `12px solid ${style.accent}` }}>
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-2">
          <span className={`px-3 py-1 text-[10px] font-black text-white rounded-full tracking-widest ${style.label}`}>
            {fortune.title}
          </span>
          <h4 className={`text-3xl font-black ${style.text} tracking-tighter pt-2`}>
            {fortune.name}
          </h4>
        </div>
        <div className="text-right opacity-10">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-ink">Classification</span>
          <div className="text-4xl font-black text-brand-ink leading-none">{fortune.category}</div>
        </div>
      </div>
      
      <div className={`p-6 rounded-2xl ${style.bg} mb-8`}>
        <p className="text-base text-stone-700 leading-relaxed font-medium whitespace-pre-wrap">
          {fortune.description}
        </p>
      </div>
      
      <div className="flex justify-between items-center pt-6 border-t border-stone-100">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${style.label} animate-pulse`}></div>
          <span className="text-xs font-black text-stone-400 uppercase tracking-widest">
            {fortune.status === 'good' ? 'Great Luck' : fortune.status === 'bad' ? 'Caution' : 'Balanced'}
          </span>
        </div>
        <span className="text-[10px] text-stone-300 italic font-bold">MyeongGyeong Precise Report</span>
      </div>
    </div>
  );
};

export default LuckCard;