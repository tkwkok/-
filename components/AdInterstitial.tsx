
import React, { useEffect, useState } from 'react';

interface Props {
  onClose: () => void;
}

const AdInterstitial: React.FC<Props> = ({ onClose }) => {
  const [seconds, setSeconds] = useState(3);

  useEffect(() => {
    if (seconds > 0) {
      const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [seconds]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center p-6 backdrop-blur-sm">
      <div className="w-full max-w-xs bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col items-center border border-white/10">
        <div className="w-full bg-stone-50 py-3 px-6 flex justify-between items-center border-b border-stone-100">
          <span className="text-[10px] font-bold text-stone-400">안내 말씀</span>
          {seconds > 0 ? (
            <span className="text-[10px] font-bold text-[#8b2e2e]">{seconds}초 후 닫기</span>
          ) : (
            <button onClick={onClose} className="text-[#8b2e2e] font-black text-xs flex items-center gap-1">닫기</button>
          )}
        </div>

        <div className="w-full aspect-square bg-white flex flex-col items-center justify-center p-8">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-stone-50 rounded-2xl mx-auto flex items-center justify-center">
              <span className="text-[#c5a059] text-xl font-black">明</span>
            </div>
            <p className="text-stone-500 text-xs leading-relaxed">
              무료 서비스 운영을 위해<br/>후원 광고가 송출 중입니다.
            </p>
          </div>
        </div>

        <div className="w-full p-6">
          <button 
            disabled={seconds > 0}
            onClick={onClose}
            className={`w-full py-4 rounded-xl font-bold text-sm transition-all ${seconds > 0 ? 'bg-stone-50 text-stone-300' : 'bg-[#8b2e2e] text-white'}`}
          >
            결과 확인하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdInterstitial;
