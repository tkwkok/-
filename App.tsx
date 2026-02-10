import React, { useState, useEffect, useCallback } from 'react';
import { FortuneResult } from './types';
import { getHangulStroke, analyzeFortune } from './services/strokeEngine';
import LuckCard from './components/LuckCard';
import AdInterstitial from './components/AdInterstitial';

const App: React.FC = () => {
  const [view, setView] = useState<'main' | 'guide' | 'consult' | 'privacy'>('main');
  
  const [nameInput, setNameInput] = useState({ s: '', n1: '', n2: '' });
  
  const [results, setResults] = useState<FortuneResult[]>([]);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [showAd, setShowAd] = useState(false);

  const loadingMessages = [
    "성명의 파동을 주역 64괘로 치환하는 중입니다...",
    "원형이정 4격의 흐름을 정밀하게 대조하고 있습니다...",
    "운명의 거울(明鏡)을 맑게 닦아내는 중입니다...",
    "당신의 주역 리포트를 우아하게 작성하고 있습니다..."
  ];

  useEffect(() => {
    let timer: any;
    if (isLoading) {
      let idx = 0;
      setLoadingMsg(loadingMessages[0]);
      timer = setInterval(() => {
        idx = (idx + 1) % loadingMessages.length;
        setLoadingMsg(loadingMessages[idx]);
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isLoading]);

  const incrementCount = () => {
    const count = parseInt(localStorage.getItem('mg_analysis_count') || '0') + 1;
    localStorage.setItem('mg_analysis_count', count.toString());
    return count;
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  const handleHangulInput = useCallback((key: 's' | 'n1' | 'n2', val: string) => {
    const latestChar = val.trim().length > 0 ? val.trim().slice(-1) : "";
    setNameInput(prev => ({ ...prev, [key]: latestChar }));
  }, []);

  const runAnalysis = async () => {
    const sVal = nameInput.s.trim();
    const n1Val = nameInput.n1.trim();
    const n2Val = nameInput.n2.trim();

    if (!sVal || !n1Val || !n2Val) { 
      alert("성함 3글자를 모두 입력해 주세요."); 
      return; 
    }
    
    const sChar = sVal;
    const n1Char = n1Val;
    const n2Char = n2Val;
    const sStrokes = getHangulStroke(sChar);
    const n1Strokes = getHangulStroke(n1Char);
    const n2Strokes = getHangulStroke(n2Char);

    setIsLoading(true);
    setIsAnalyzed(false);
    
    const count = incrementCount();
    const shouldShowAd = count % 4 === 0;

    setTimeout(() => {
      const baseResults = analyzeFortune(sStrokes, n1Strokes, n2Strokes, sChar, n1Char, n2Char);
      setResults(baseResults);
      setIsLoading(false);

      if (shouldShowAd) {
        setShowAd(true);
      } else {
        setIsAnalyzed(true);
        setTimeout(() => {
          document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    }, 2000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-brand-paper/95 flex flex-col items-center justify-center p-10 text-center backdrop-blur-md">
          <div className="relative mb-10">
            <div className="w-28 h-28 border-[6px] border-brand-gold/10 border-t-brand-red rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-brand-red font-black text-2xl">明</span>
            </div>
          </div>
          <p className="text-brand-ink font-black text-xl animate-pulse tracking-tighter">{loadingMsg}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl h-16 flex items-center justify-between px-6 border-b border-stone-100 shadow-sm">
        <button onClick={() => setView('main')} className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-brand-red rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <span className="text-white text-base font-black">明</span>
          </div>
          <span className="text-brand-ink text-xl font-black tracking-tighter">명경</span>
        </button>
        <div className="hidden md:flex gap-10 items-center">
          <button onClick={() => setView('main')} className={`text-[11px] font-black tracking-widest uppercase ${view === 'main' ? 'text-brand-red' : 'text-stone-400'}`}>HOME</button>
          <button onClick={() => setView('consult')} className="px-5 py-2.5 bg-brand-red text-white text-[11px] font-black rounded-full tracking-widest uppercase hover:bg-brand-ink transition-all shadow-md">PREMIUM CARE</button>
        </div>
      </nav>

      <div className="max-w-md mx-auto flex-1 w-full pb-32 pt-10 px-6">
        {view === 'main' && (
          <div className="fade-in-up">
            <header className="text-center mb-16">
              <span className="text-[10px] text-brand-gold font-black tracking-[0.5em] uppercase mb-4 block">The I-Ching Mirror</span>
              <h1 className="text-7xl font-black text-brand-ink tracking-tighter mb-6">명경<span className="text-brand-red">.</span></h1>
              <p className="text-stone-400 text-sm font-medium leading-relaxed italic max-w-[240px] mx-auto text-pretty">성명의 이치를 거울처럼 비추어 인생의 지도를 그리다</p>
            </header>

            {/* Ad Unit Above Input */}
            <div className="ad-placeholder">광고 영역 (자동 배치)</div>

            <main>
              <div className="premium-oriental-card p-12 mb-20 bg-white shadow-2xl relative">
                <div className="grid grid-cols-3 gap-4 mb-16 relative">
                  {(['s', 'n1', 'n2'] as const).map((key, idx) => (
                    <div key={idx} className="relative flex flex-col items-center">
                      <div className="bg-label-text opacity-[0.03] select-none text-9xl">{idx === 0 ? '姓' : idx === 1 ? '名' : '字'}</div>
                      <div className="w-full relative z-10">
                        <input 
                          type="text" 
                          maxLength={1} 
                          value={nameInput[key]} 
                          onChange={(e) => handleHangulInput(key, e.target.value)} 
                          onFocus={(e) => e.target.select()} 
                          className="input-premium" 
                          placeholder="?" 
                        />
                        <div className="input-border"></div>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={runAnalysis} disabled={isLoading} className="btn-destiny active:scale-95 group">
                  <span className="relative z-10 tracking-widest">{isLoading ? '운명 해독 중...' : '주역 64괘 분석 결과 보기'}</span>
                </button>
              </div>

              <div id="result-section">
                {isAnalyzed && (
                  <div className="space-y-12 fade-in-up">
                    {/* Color Legend */}
                    <div className="flex items-center justify-center gap-6 py-4 bg-stone-50 rounded-2xl border border-stone-100">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-brand-blue"></div>
                        <span className="text-[10px] font-black text-brand-blue tracking-tighter">길운(吉運): 푸른색</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-brand-red"></div>
                        <span className="text-[10px] font-black text-brand-red tracking-tighter">흉운(凶運): 붉은색</span>
                      </div>
                    </div>

                    <div className="grid gap-8">
                      {results.map((res, i) => <LuckCard key={i} fortune={res} />)}
                    </div>

                    {/* Ad Unit Middle */}
                    <div className="ad-placeholder">광고 영역 (자동 배치)</div>
                  </div>
                )}
              </div>

              {/* Educational Content for AdSense Approval */}
              <section className="mt-32 space-y-16 border-t border-stone-100 pt-20">
                <div className="space-y-6">
                  <h2 className="text-3xl font-black text-brand-ink tracking-tighter text-pretty">주역 성명학이란 무엇인가?</h2>
                  <p className="text-stone-600 text-[15px] leading-relaxed font-medium text-justify">
                    주역 성명학은 만물의 근원인 음양오행의 원리를 성명의 획수에 적용하여 인간의 길흉화복을 분석하는 동양 철학의 정수입니다. 이름은 단순한 호칭을 넘어 개인의 고유한 에너지 파동을 형성하며, 이 파동이 하늘의 기운(천기)과 어떻게 조화를 이루느냐에 따라 인생의 향방이 결정된다고 봅니다.
                  </p>
                </div>

                <div className="grid gap-10">
                  <div className="p-8 bg-white rounded-3xl border border-stone-100 shadow-sm space-y-4">
                    <h3 className="font-black text-brand-gold text-lg italic">01. 원형이정(元亨利貞)의 원리</h3>
                    <p className="text-stone-500 text-sm leading-relaxed">
                      주역의 네 가지 덕목인 원형이정은 인생의 네 단계를 의미합니다. <strong>원(元)</strong>은 초년의 시작을, <strong>형(亨)</strong>은 중년의 형통함을, <strong>이(利)</strong>는 장년의 결실을, <strong>정(貞)</strong>은 인생 전체의 완성도를 나타냅니다. 명경은 이 네 가지 격을 정밀하게 계산하여 입체적인 운세 리포트를 제공합니다.
                    </p>
                  </div>
                  <div className="p-8 bg-white rounded-3xl border border-stone-100 shadow-sm space-y-4">
                    <h3 className="font-black text-brand-gold text-lg italic">02. 64괘의 상징적 함의</h3>
                    <p className="text-stone-500 text-sm leading-relaxed">
                      주역의 64괘는 우주와 인간사에서 일어날 수 있는 모든 변화의 양상을 담고 있습니다. 이름의 획수가 상괘와 하괘로 치환되어 64괘 중 하나로 결정될 때, 그 괘가 가진 상징적 의미는 사용자에게 나아가야 할 방향과 조심해야 할 징조를 동시에 제시합니다.
                    </p>
                  </div>
                </div>

                <div className="bg-brand-ink text-white p-12 rounded-[3rem] space-y-6">
                  <h3 className="text-2xl font-black tracking-tighter">올바른 작명을 위한 제언</h3>
                  <p className="text-stone-400 text-sm leading-relaxed">
                    작명은 단순히 좋은 뜻을 가진 글자를 조합하는 것이 아닙니다. 타고난 사주의 부족한 기운을 보완하고, 수리의 배치와 주역의 괘상이 조화롭게 어우러져야 비로소 좋은 이름이라 할 수 있습니다. 명경의 분석 리포트를 통해 본인 이름의 에너지를 점검해 보시기 바랍니다.
                  </p>
                </div>
              </section>
            </main>
          </div>
        )}

        {view === 'consult' && (
          <div className="fade-in-up py-8">
             <header className="mb-16 text-center space-y-4">
               <span className="text-brand-gold font-black text-[10px] tracking-[0.5em] uppercase block">Exclusive Service</span>
               <h2 className="text-5xl font-black text-brand-ink tracking-tighter">프리미엄 1:1 상담</h2>
             </header>

             <div className="bg-white rounded-[2.5rem] p-10 mb-12 border-2 border-brand-gold/20 shadow-xl space-y-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                 <div className="text-7xl font-black italic">VIP</div>
               </div>
               <div className="space-y-4 relative z-10">
                 <h4 className="font-black text-brand-red text-lg flex items-center gap-2 tracking-tighter uppercase">
                   <span className="w-2 h-2 bg-brand-red rounded-full"></span>
                   Expert Deep Analysis
                 </h4>
                 <p className="text-stone-800 text-sm font-bold leading-relaxed">
                   명경 프리미엄 서비스는 단순 분석을 넘어 인생의 길을 열어주는 고품격 작명 서비스를 제공합니다.
                 </p>
                 <div className="grid gap-3 pt-4">
                   {[
                     "한자 64괘 정밀 감정",
                     "발음오행 상생 진단",
                     "발음음양 조화 분석",
                     "81수리 정통 작명법 적용",
                     "자원오행 보완",
                     "사주 용신(用神) 기반 최적화"
                   ].map((item, idx) => (
                     <div key={idx} className="flex items-center gap-3 text-stone-600 text-[13px] font-bold">
                       <span className="text-brand-gold">✦</span>
                       {item}
                     </div>
                   ))}
                 </div>
                 <div className="mt-8 p-4 bg-brand-red/5 rounded-2xl border border-brand-red/10">
                   <p className="text-brand-red text-xs font-black text-center tracking-tight">
                     ※ 한자64괘, 발음오행, 발음음양, 81수리, 자원오행, 용신분석까지 포함한 작명 서비스 제공(본 서비스는 유료로 제공됩니다)
                   </p>
                 </div>
               </div>
             </div>

             <form action="https://formspree.io/f/xpqjwjjw" method="POST" className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                 <input name="name" required placeholder="성함" className="p-5 bg-white rounded-2xl border border-stone-100 outline-none font-bold text-sm shadow-sm focus:border-brand-red transition-all" />
                 <input name="phone" required placeholder="연락처" className="p-5 bg-white rounded-2xl border border-stone-100 outline-none font-bold text-sm shadow-sm focus:border-brand-red transition-all" />
               </div>
               <textarea name="memo" rows={5} placeholder="상담 희망 내용 또는 태어난 시각(사주 분석용)" className="w-full p-6 bg-white rounded-2xl border border-stone-100 outline-none font-bold text-sm resize-none shadow-sm focus:border-brand-red transition-all"></textarea>
               <button type="submit" className="w-full py-6 bg-brand-red text-white font-black rounded-2xl text-base shadow-2xl hover:bg-brand-ink transition-all active:scale-95">
                 프리미엄 상담 신청하기
               </button>
             </form>
          </div>
        )}

        {view === 'privacy' && (
          <div className="fade-in-up py-8 space-y-10">
            <h2 className="text-4xl font-black text-brand-ink tracking-tighter">개인정보처리방침</h2>
            <div className="text-stone-600 text-sm leading-relaxed space-y-6 font-medium">
              <p>본 서비스(명경)는 사용자의 개인정보를 소중히 다룹니다. 입력된 이름 데이터는 분석 목적으로만 일시적으로 사용되며 서버에 영구히 저장되지 않습니다.</p>
              <h3 className="text-brand-ink font-bold text-lg pt-4">1. 수집하는 개인정보 항목</h3>
              <p>사용자가 직접 입력하는 성명 정보를 수집합니다.</p>
              <h3 className="text-brand-ink font-bold text-lg pt-4">2. 개인정보 수집 및 이용 목적</h3>
              <p>주역 성명학 분석 결과 제공 및 상담 예약 확인을 위해서만 사용됩니다.</p>
              <h3 className="text-brand-ink font-bold text-lg pt-4">3. 광고 및 쿠키 사용</h3>
              <p>본 사이트는 구글 애드센스 광고를 송출하며, 서비스 최적화를 위해 브라우저 쿠키를 사용할 수 있습니다. 사용자는 브라우저 설정에서 이를 거부할 수 있습니다.</p>
            </div>
            <button onClick={() => setView('main')} className="text-brand-red font-black text-xs tracking-widest uppercase border-b-2 border-brand-red pb-1">돌아가기</button>
          </div>
        )}

        <footer className="mt-40 border-t border-stone-100 pt-20 pb-16 text-center space-y-8">
          <div className="flex justify-center gap-6 text-[10px] font-black text-stone-400 tracking-widest uppercase">
             <button onClick={() => setView('privacy')} className="hover:text-brand-red transition-colors">PRIVACY POLICY</button>
             <button onClick={() => setView('consult')} className="hover:text-brand-red transition-colors">TERMS OF USE</button>
          </div>
          <p className="text-[10px] text-stone-400 font-bold leading-loose tracking-tight uppercase">
            © 2025 Myeonggyeong Project. All rights reserved.<br/>
            Traditional Oriental Wisdom Solutions.
          </p>
        </footer>
      </div>

      <div className="mobile-nav md:hidden shadow-lg border-t border-stone-100 bg-white/95">
        <button onClick={() => setView('main')} className={`flex flex-col items-center gap-1 ${view === 'main' ? 'text-brand-red' : 'text-stone-300'}`}>
          <div className="text-xl">⛩️</div><span className="text-[8px] font-black uppercase tracking-tighter">HOME</span>
        </button>
        <button onClick={() => setView('consult')} className={`flex flex-col items-center gap-1 ${view === 'consult' ? 'text-brand-red' : 'text-stone-300'}`}>
          <div className="text-xl">💎</div><span className="text-[8px] font-black uppercase tracking-tighter">VIP</span>
        </button>
      </div>

      {showAd && <AdInterstitial onClose={() => { setShowAd(false); setIsAnalyzed(true); setTimeout(() => document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' }), 300); }} />}
    </div>
  );
};

export default App;