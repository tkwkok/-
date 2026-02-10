
import React, { useEffect, useState } from 'react';

interface Props {
  onClose: () => void;
}

const AdInterstitial: React.FC<Props> = ({ onClose }) => {
  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    if (seconds > 0) {
      const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [seconds]);

  return (
    <div className="fixed inset-0 z-[100] bg-brand-ink/95 flex flex-col items-center justify-center p-6 backdrop-blur-xl">
      <div className="w-full max-w-sm bg-brand-paper rounded-[3rem] overflow-hidden shadow-2xl flex flex-col items-center border border-brand-gold/20">
        <div className="w-full bg-white py-4 px-8 flex justify-between items-center border-b border-stone-100">
          <span className="text-[10px] font-black text-stone-400 tracking-widest uppercase">Sponsored Guidance</span>
          {seconds > 0 ? (
            <span className="text-[10px] font-black text-brand-red">{seconds}S</span>
          ) : (
            <button onClick={onClose} className="text-brand-red font-black text-xs">CLOSE</button>
          )}
        </div>

        <div className="w-full aspect-square bg-white flex flex-col items-center justify-center p-12">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-brand-red rounded-[1.5rem] mx-auto flex items-center justify-center shadow-xl rotate-3">
              <span className="text-white text-2xl font-black">明</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-brand-ink tracking-tighter">품격 있는 분석을 위해</h3>
              <p className="text-stone-400 text-sm leading-relaxed font-medium">
                명경의 무료 분석 서비스 유지를 위해<br/>잠시 후 광고가 송출됩니다.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full p-8 bg-stone-50">
          <button 
            disabled={seconds > 0}
            onClick={onClose}
            className={`w-full py-5 rounded-2xl font-black text-base transition-all ${seconds > 0 ? 'bg-stone-200 text-stone-400' : 'bg-brand-red text-white shadow-xl hover:scale-105 active:scale-95'}`}
          >
            {seconds > 0 ? `잠시만 기다려주세요` : '결과 확인하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdInterstitial;
