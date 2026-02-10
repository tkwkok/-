
import React from 'react';
import { FortuneResult } from '../types';

interface Props {
  fortune: FortuneResult;
}

const LuckCard: React.FC<Props> = ({ fortune }) => {
  const getStatusStyle = () => {
    switch(fortune.status) {
      case 'good': return { 
        accent: '#1e4d6b', 
        label: 'bg-blue-600', 
        text: 'text-blue-900'
      };
      case 'bad': return { 
        accent: '#8b2e2e', 
        label: 'bg-[#8b2e2e]', 
        text: 'text-[#8b2e2e]'
      };
      default: return { 
        accent: '#c5a059', 
        label: 'bg-stone-500', 
        text: 'text-stone-800'
      };
    }
  };

  const style = getStatusStyle();

  return (
    <div className={`oriental-card p-8 relative overflow-hidden border-t-4 transition-transform hover:-translate-y-1`} style={{ borderTopColor: style.accent }}>
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
          <span className={`px-2 py-0.5 text-[10px] font-bold text-white rounded tracking-wider ${style.label}`}>
            {fortune.title}
          </span>
          <h4 className={`text-2xl font-black ${style.text} tracking-tighter`}>
            {fortune.name}
          </h4>
        </div>
        {/* Fix: Replaced reference to non-existent fortune.code with fortune.category to fix line 45 error */}
        <div className="flex flex-col items-end opacity-20">
          <span className="text-[9px] font-bold uppercase tracking-widest text-stone-900">운세 분류</span>
          <span className="text-2xl font-black text-stone-900 leading-none">{fortune.category}</span>
        </div>
      </div>
      
      <div className="relative">
        <p className="text-sm text-stone-600 leading-relaxed font-medium">
          {fortune.description}
        </p>
      </div>
      
      <div className="mt-8 pt-4 border-t border-stone-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${style.label} animate-pulse`}></div>
          <span className="text-[10px] font-bold text-stone-400">
            {fortune.status === 'good' ? '대길(大吉)' : fortune.status === 'bad' ? '주의(注意)' : '평온(平穩)'}
          </span>
        </div>
        <span className="text-[9px] text-stone-300 italic font-bold">명경 분석 시스템 5.0</span>
      </div>
    </div>
  );
};

export default LuckCard;
