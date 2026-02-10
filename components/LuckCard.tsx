
import React from 'react';
import { FortuneResult } from '../types';

interface Props {
  fortune: FortuneResult;
}

const LuckCard: React.FC<Props> = ({ fortune }) => {
  const getColors = () => {
    switch(fortune.status) {
      case 'good': return { border: 'border-t-[#1e4d6b]', label: 'bg-blue-600', text: 'text-[#1e4d6b]', bg: 'bg-blue-50/30' };
      case 'bad': return { border: 'border-t-[#722f37]', label: 'bg-[#722f37]', text: 'text-[#722f37]', bg: 'bg-red-50/30' };
      default: return { border: 'border-t-stone-200', label: 'bg-stone-500', text: 'text-stone-700', bg: 'bg-white' };
    }
  };

  const colors = getColors();

  return (
    <div className={`group oriental-card p-6 rounded-[2.5rem] border-t-8 shadow-xl transition-all hover:-translate-y-1 ${colors.border} ${colors.bg}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
          <span className={`px-2 py-0.5 text-[9px] font-black text-white rounded-full uppercase tracking-widest ${colors.label}`}>
            {fortune.title}
          </span>
          <h4 className={`text-2xl font-black ${colors.text} leading-tight`}>
            {fortune.name}
          </h4>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Hexagram</span>
          <span className="text-2xl font-black text-stone-900 tabular-nums">{fortune.code}</span>
        </div>
      </div>
      
      <div className="relative">
          <div className="absolute top-0 left-0 w-8 h-8 opacity-5">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.895 14.912 16 16.017 16H19.017V14H15.017C13.912 14 13.017 13.105 13.017 12V3C13.017 1.895 13.912 1 15.017 1H22.017C23.122 1 24.017 1.895 24.017 3V12C24.017 13.105 23.122 14 22.017 14H21.017V21H14.017ZM0.017 21L0.017 18C0.017 16.895 0.912 16 2.017 16H5.017V14H1.017C0.912 14 0.017 13.105 0.017 12V3C0.017 1.895 0.912 1 2.017 1H9.017C10.122 1 11.017 1.895 11.017 3V12C11.017 13.105 10.122 14 9.017 14H8.017V21H0.017Z"/></svg>
          </div>
          <p className="text-[14px] text-stone-600 leading-[1.8] font-medium p-4 italic">
            {fortune.description}
          </p>
      </div>
      
      <div className="mt-4 pt-4 border-t border-stone-100 flex justify-between items-center text-[10px] font-bold text-stone-400">
          <span>{fortune.status === 'good' ? '길(吉)' : fortune.status === 'bad' ? '흉(凶)' : '평(平)'} 기운</span>
          <span className="opacity-50">명경(明鏡) 분석 엔진 V5.0</span>
      </div>
    </div>
  );
};

export default LuckCard;
