
import React, { useEffect, useState } from 'react';

interface Props {
  onClose: () => void;
}

const AdInterstitial: React.FC<Props> = ({ onClose }) => {
  const [seconds, setSeconds] = useState(3); // 광고 시청 의무 시간

  useEffect(() => {
    if (seconds > 0) {
      const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [seconds]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-6 backdrop-blur-md">
      <div className="ad-modal w-full max-w-sm bg-white rounded-[40px] overflow-hidden shadow-2xl flex flex-col items-center border border-white/10">
        {/* 광고 헤더 */}
        <div className="w-full bg-stone-100 py-3 px-6 flex justify-between items-center border-b border-stone-200">
          <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Sponsored</span>
          {seconds > 0 ? (
            <span className="text-[10px] font-bold text-[#722f37]">{seconds}초 후 닫기</span>
          ) : (
            <button onClick={onClose} className="text-[#722f37] font-black text-sm flex items-center gap-1">
              닫기 
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          )}
        </div>

        {/* 광고 영역 */}
        <div className="w-full aspect-square bg-stone-50 flex flex-col items-center justify-center relative p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-[#c5a059]/10 rounded-3xl mx-auto flex items-center justify-center">
              <span className="text-[#c5a059] text-2xl font-black tracking-tighter">明鏡</span>
            </div>
            <p className="text-stone-400 text-xs leading-relaxed">
              본 서비스는 무료 운영을 위해<br/>후원 광고를 송출하고 있습니다.
            </p>
            <div className="py-2 px-6 border-2 border-stone-100 rounded-full inline-block text-[11px] font-black text-stone-300 uppercase tracking-widest">
              AdSense Slot
            </div>
          </div>
        </div>

        {/* 광고 하단 */}
        <div className="w-full p-6 text-center">
          <button 
            disabled={seconds > 0}
            onClick={onClose}
            className={`w-full py-5 rounded-2xl font-black text-lg transition-all ${seconds > 0 ? 'bg-stone-50 text-stone-200' : 'bg-[#722f37] text-white shadow-xl active:scale-95'}`}
          >
            분석 결과 확인하기
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-white/30 text-[9px] text-center max-w-[200px] font-bold uppercase tracking-widest">
        Official Partner of MyeongGyeong
      </p>
    </div>
  );
};

export default AdInterstitial;
