
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { AnalysisMode, HanjaItem, FortuneResult } from './types';
import { getHangulStroke, analyzeFortune } from './services/strokeEngine';
import HanjaSelector from './components/HanjaSelector';
import LuckCard from './components/LuckCard';
import AdInterstitial from './components/AdInterstitial';

const App: React.FC = () => {
  const [mode, setMode] = useState<AnalysisMode>(AnalysisMode.HANGUL);
  const [view, setView] = useState<'main' | 'guide'>('main');
  
  const [nameInput, setNameInput] = useState({ s: '', n1: '', n2: '' });
  const [hanjaItems, setHanjaItems] = useState<(HanjaItem | null)[]>([null, null, null]);
  const [curSlot, setCurSlot] = useState<number | null>(null);
  
  const [results, setResults] = useState<FortuneResult[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAd, setShowAd] = useState(false);

  // 5회당 1회 광고 로직
  const getAnalysisCount = () => parseInt(localStorage.getItem('myeonggyeong_count') || '0');
  const incrementCount = () => {
    const nextCount = getAnalysisCount() + 1;
    localStorage.setItem('myeonggyeong_count', nextCount.toString());
    return nextCount;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const runAnalysis = async () => {
    let sStrokes = 0, n1Strokes = 0, n2Strokes = 0;
    let sChar = '', n1Char = '', n2Char = '';

    if (mode === AnalysisMode.HANGUL) {
      if (!nameInput.s || !nameInput.n1 || !nameInput.n2) { alert("성함을 모두 입력해주세요."); return; }
      sStrokes = getHangulStroke(nameInput.s);
      n1Strokes = getHangulStroke(nameInput.n1);
      n2Strokes = getHangulStroke(nameInput.n2);
      sChar = nameInput.s; n1Char = nameInput.n1; n2Char = nameInput.n2;
    } else {
      if (hanjaItems.some(x => x === null)) { alert("한자를 모두 선택해주세요."); return; }
      sStrokes = hanjaItems[0]!.s; n1Strokes = hanjaItems[1]!.s; n2Strokes = hanjaItems[2]!.s;
      sChar = hanjaItems[0]!.k; n1Char = hanjaItems[1]!.k; n2Char = hanjaItems[2]!.k;
    }

    setIsLoading(true);
    
    // 5번째 분석마다 광고 호출
    const currentCount = incrementCount();
    if (currentCount % 5 === 0) {
      setShowAd(true);
    }

    const baseResults = analyzeFortune(sStrokes, n1Strokes, n2Strokes, sChar, n1Char, n2Char);
    setResults(baseResults);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const fullName = mode === AnalysisMode.HANGUL ? `${nameInput.s}${nameInput.n1}${nameInput.n2}` : hanjaItems.map(h => h?.h).join('');
      const prompt = `성명학 전문가로서 이름 '${fullName}'에 대해 발음오행, 발음음양, 81수리를 바탕으로 품격 있고 정중하게 분석해 주세요. 특히 이 이름이 가진 미래의 가능성과 주의할 점을 심층적으로 다뤄주세요.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setAiAnalysis(response.text || "분석 완료되었습니다.");
    } catch (e) {
      setAiAnalysis("현재 데이터 분석량이 많습니다. 기본 분석 결과를 참고해 주십시오.");
    }
    
    if (currentCount % 5 !== 0) {
      setIsAnalyzed(true);
      setTimeout(() => document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' }), 300);
    }
    setIsLoading(false);
  };

  const handleCloseAd = () => {
    setShowAd(false);
    setIsAnalyzed(true);
    setTimeout(() => {
      document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header/Nav */}
      <nav className="sticky top-0 z-40 bg-brand-paper/80 backdrop-blur-md h-20 flex items-center border-b border-brand-gold/10">
        <div className="max-w-md mx-auto w-full flex justify-between items-center px-6">
          <button onClick={() => setView('main')} className="group flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
              <span className="text-white text-xl font-black">明</span>
            </div>
            <span className="text-brand-ink text-2xl font-black tracking-tighter">명경</span>
          </button>
          <div className="flex gap-6">
            <button onClick={() => setView('main')} className={`text-sm font-black ${view === 'main' ? 'text-brand-red' : 'text-stone-400'}`}>HOME</button>
            <button onClick={() => setView('guide')} className={`text-sm font-black ${view === 'guide' ? 'text-brand-red' : 'text-stone-400'}`}>GUIDE</button>
          </div>
        </div>
      </nav>

      <div className="max-w-md mx-auto flex-1 w-full pb-32 pt-12 px-6">
        {view === 'main' ? (
          <div className="fade-in-up">
            <header className="text-center mb-16">
              <span className="text-[10px] text-brand-gold font-black tracking-[0.5em] uppercase mb-4 block">PREMIUM NAME ANALYSIS</span>
              <h1 className="text-7xl font-black text-brand-ink leading-tight mb-4">명경<span className="text-brand-red">.</span></h1>
              <p className="text-stone-500 text-base font-medium leading-relaxed italic">이름의 이치를 거울처럼 비추어<br/>삶의 길을 밝히는 최고의 지혜</p>
            </header>

            <div className="flex bg-stone-100 p-1.5 rounded-[2.5rem] mb-12">
              <button onClick={() => setMode(AnalysisMode.HANGUL)} className={`flex-1 py-4 rounded-[2.2rem] text-sm font-black transition-all ${mode === AnalysisMode.HANGUL ? 'bg-white text-brand-red shadow-lg' : 'text-stone-500'}`}>한글 분석</button>
              <button onClick={() => setMode(AnalysisMode.HANJA)} className={`flex-1 py-4 rounded-[2.2rem] text-sm font-black transition-all ${mode === AnalysisMode.HANJA ? 'bg-white text-brand-red shadow-lg' : 'text-stone-500'}`}>한자 분석</button>
            </div>

            <main>
              <div className="premium-oriental-card p-10 mb-24">
                <div className="grid grid-cols-3 gap-2 mb-20 relative">
                  {(mode === AnalysisMode.HANGUL ? ['s', 'n1', 'n2'] : [0, 1, 2]).map((key, idx) => (
                    <div key={idx} className="relative flex flex-col items-center">
                      <div className="bg-label-text">{idx === 0 ? '姓' : idx === 1 ? '名' : '字'}</div>
                      <div className="w-full relative z-10">
                        {mode === AnalysisMode.HANGUL ? (
                          <input 
                            type="text"
                            value={nameInput[key as 's'|'n1'|'n2']}
                            onChange={(e) => setNameInput(prev => ({ ...prev, [key]: e.target.value.substring(0,1) }))}
                            className="input-premium"
                            placeholder="?"
                          />
                        ) : (
                          <button 
                            onClick={() => setCurSlot(idx)}
                            className="input-premium min-h-[140px] flex items-center justify-center"
                          >
                            {hanjaItems[idx] ? hanjaItems[idx]!.h : '?'}
                          </button>
                        )}
                        <div className="input-border"></div>
                      </div>
                      <span className="stroke-count-text">
                        {(mode === AnalysisMode.HANGUL ? getHangulStroke(nameInput[key as 's'|'n1'|'n2']) : hanjaItems[idx]?.s) || 0} STRK
                      </span>
                    </div>
                  ))}
                </div>

                <button onClick={runAnalysis} disabled={isLoading} className="btn-destiny">
                  {isLoading ? '분석 운행 중...' : '운명 리포트 생성'}
                </button>
              </div>

              <div id="result-section">
                {isAnalyzed && (
                  <div className="space-y-16 fade-in-up">
                    <div className="bg-white rounded-[3rem] p-12 border-t-[12px] border-brand-gold shadow-2xl relative">
                      <div className="absolute top-8 right-8 text-brand-gold opacity-10 font-black text-6xl">評</div>
                      <h4 className="text-brand-red text-2xl font-black mb-8 flex items-center gap-3">
                        AI 성명 감정서
                      </h4>
                      <p className="text-stone-700 leading-loose text-lg font-medium whitespace-pre-wrap">{aiAnalysis}</p>
                    </div>
                    <div className="grid gap-10">
                      {results.map((res, i) => <LuckCard key={i} fortune={res} />)}
                    </div>
                  </div>
                )}
              </div>

              {/* Consultation Section - 고도화 */}
              <section className="mt-48 text-center px-4 bg-white rounded-[4rem] p-16 shadow-inner border border-stone-100">
                <span className="text-brand-gold font-black text-xs tracking-widest mb-4 block uppercase">Exclusive Consultation</span>
                <h2 className="text-5xl font-black text-brand-ink mb-6 tracking-tighter">프리미엄 작명 상담</h2>
                <div className="space-y-2 mb-12 text-stone-500 text-base font-medium leading-relaxed">
                  <p className="flex items-center justify-center gap-2">✓ <span className="text-stone-900 font-bold">발음오행/음양</span> 심층 분석</p>
                  <p className="flex items-center justify-center gap-2">✓ <span className="text-stone-900 font-bold">81수리/자원오행</span> 맞춤 적용</p>
                  <p className="flex items-center justify-center gap-2">✓ <span className="text-stone-900 font-bold">용신분석</span> 기반 사주 보완</p>
                  <p className="mt-4 italic">"평생 불릴 귀한 이름을 선사합니다."</p>
                </div>
                
                <form action="https://formspree.io/f/xpqjwjjw" method="POST" className="space-y-4 max-w-[340px] mx-auto">
                  <input name="name" required placeholder="성함" className="w-full p-6 bg-stone-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-brand-red/20 transition-all font-bold" />
                  <input name="contact" required placeholder="연락처" className="w-full p-6 bg-stone-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-brand-red/20 transition-all font-bold" />
                  <textarea name="message" rows={3} placeholder="고민 내용 (선택사항)" className="w-full p-6 bg-stone-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-brand-red/20 transition-all font-bold resize-none"></textarea>
                  <button type="submit" className="w-full py-6 bg-brand-ink text-white font-black text-xl rounded-2xl shadow-2xl hover:bg-brand-red transition-all mt-4">
                    VIP 상담 신청하기
                  </button>
                </form>
              </section>
            </main>
          </div>
        ) : (
          <div className="fade-in-up py-10 space-y-24">
            <h2 className="text-6xl font-black text-brand-ink text-center tracking-tighter">성명학의 도리<span className="text-brand-red">.</span></h2>
            <div className="grid gap-12">
              {[
                {t: "발음오행", d: "성명의 초성 소리가 가진 목·화·토·금·수 오행의 상생 흐름을 분석하여 대인관계와 사회적 성공운을 살핍니다."},
                {t: "발음음양", d: "이름 획수의 짝수(음)와 홀수(양)가 적절히 조화를 이루어 인생의 굴곡을 줄이고 안정을 도모하는지 판별합니다."},
                {t: "81수리", d: "수리 철학을 기반으로 초년·중년·장년·총운의 4격(원형이정)을 분석하여 생애 주기별 운세를 확인합니다."},
                {t: "자원오행 & 용신", d: "상담 시 제공되는 서비스로, 개인의 사주에서 부족한 기운(용신)을 한자의 부수가 가진 오행(자원오행)으로 보강하는 고차원 분석법입니다."}
              ].map((item, i) => (
                <div key={i} className="premium-oriental-card p-12 !border-l-brand-gold">
                  <h4 className="text-2xl font-black text-brand-red mb-6">{item.t}</h4>
                  <p className="text-stone-600 leading-loose text-lg font-medium">{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer for Trust (AdSense requirement) */}
        <footer className="mt-40 pt-20 border-t border-stone-200 text-center pb-10">
          <div className="mb-10 opacity-30">
            <span className="text-2xl font-black text-brand-ink tracking-tighter">明鏡</span>
          </div>
          <div className="flex justify-center gap-6 text-[10px] font-black text-stone-400 mb-8 tracking-widest uppercase">
            <button>이용약관</button>
            <button>개인정보처리방침</button>
            <button>문의하기</button>
          </div>
          <p className="text-[10px] text-stone-300 font-medium">© 2024 MYEONGGYEONG. ALL RIGHTS RESERVED. <br/>이 서비스는 주역 성명학 원리에 기반한 AI 분석 리포트를 제공합니다.</p>
        </footer>
      </div>

      {curSlot !== null && (
        <HanjaSelector 
          title={curSlot === 0 ? "성씨" : `이름${curSlot}`} 
          onSelect={(i) => { 
            const n = [...hanjaItems]; 
            n[curSlot] = i; 
            setHanjaItems(n); 
            setCurSlot(null); 
          }} 
          onClose={() => setCurSlot(null)} 
        />
      )}

      {showAd && <AdInterstitial onClose={handleCloseAd} />}
    </div>
  );
};

export default App;
