
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

  // 404 에러 방지 및 디자인 깨짐 방지를 위한 초기화
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
    setShowAd(true); // 분석 전 광고 노출 시뮬레이션

    const baseResults = analyzeFortune(sStrokes, n1Strokes, n2Strokes, sChar, n1Char, n2Char);
    setResults(baseResults);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const fullName = mode === AnalysisMode.HANGUL ? `${nameInput.s}${nameInput.n1}${nameInput.n2}` : hanjaItems.map(h => h?.h).join('');
      const prompt = `성명학 전문가로서 다음 이름의 '자원오행'과 '용신분석'을 심층 분석해주세요. 
      이름: ${fullName} (${mode === AnalysisMode.HANGUL ? '한글' : '한자'})
      답변은 정중한 한국어로, 400자 내외의 리포트를 작성하세요. '자원오행'과 '용신' 키워드를 반드시 포함하고 조화로운 삶을 위한 조언을 덧붙이세요.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setAiAnalysis(response.text || "분석 리포트를 불러오는 중입니다.");
    } catch (e) {
      setAiAnalysis("현재 심층 분석 서버가 혼잡하여 수리 분석 결과부터 보여드립니다.");
    }

    setIsLoading(false);
  };

  const handleCloseAd = () => {
    setShowAd(false);
    setIsAnalyzed(true);
    setTimeout(() => document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' }), 300);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 상단 네비게이션 */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-2xl border-b border-[#c5a059]/20 h-20 flex items-center">
        <div className="max-w-md mx-auto w-full px-6 flex justify-between items-center">
          <button onClick={() => setView('main')} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#8b2e2e] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">明</div>
            <span className="text-2xl font-black text-stone-900 tracking-tighter">명경</span>
          </button>
          <div className="flex gap-6">
            <button onClick={() => setView('main')} className={`text-xs font-black ${view === 'main' ? 'text-[#8b2e2e]' : 'text-stone-400'}`}>운세분석</button>
            <button onClick={() => setView('guide')} className={`text-xs font-black ${view === 'guide' ? 'text-[#8b2e2e]' : 'text-stone-400'}`}>성명학 원칙</button>
          </div>
        </div>
      </nav>

      <div className="max-w-md mx-auto flex-1 w-full pb-32 pt-16 px-6">
        {view === 'main' ? (
          <div className="fade-in-up">
            <header className="text-center mb-20">
              <div className="inline-block px-4 py-1.5 border-y border-[#c5a059] mb-8">
                <span className="text-[10px] text-[#c5a059] font-black tracking-[0.6em] uppercase">Professional Naming</span>
              </div>
              <h1 className="text-9xl font-black text-stone-900 tracking-tighter mb-4">明鏡</h1>
              <p className="text-stone-400 text-lg font-medium italic">이름의 이치를 거울처럼 비추다</p>
            </header>

            {/* 탭 전환 */}
            <div className="flex p-1.5 bg-stone-100 rounded-[2.5rem] mb-16 shadow-inner">
              <button onClick={() => setMode(AnalysisMode.HANGUL)} className={`flex-1 py-4 text-xs font-black rounded-[2rem] transition-all ${mode === AnalysisMode.HANGUL ? 'bg-white text-[#8b2e2e] shadow-md' : 'text-stone-400'}`}>한글 이름 분석</button>
              <button onClick={() => setMode(AnalysisMode.HANJA)} className={`flex-1 py-4 text-xs font-black rounded-[2rem] transition-all ${mode === AnalysisMode.HANJA ? 'bg-white text-[#8b2e2e] shadow-md' : 'text-stone-400'}`}>한자 이름 분석</button>
            </div>

            <main>
              <div className="oriental-card p-10 mb-20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-[#8b2e2e]"></div>
                
                {mode === AnalysisMode.HANGUL ? (
                  <div className="grid grid-cols-3 gap-8 mb-16">
                    {(['s', 'n1', 'n2'] as const).map((key, idx) => (
                      <div key={key} className="flex flex-col items-center">
                        <label className="text-[11px] text-stone-300 font-bold mb-4">{key === 's' ? '姓 (성)' : `名 (명${idx})`}</label>
                        <input 
                          type="text" value={nameInput[key]}
                          onChange={(e) => setNameInput(prev => ({ ...prev, [key]: e.target.value.substring(0, 1) }))}
                          className="input-field w-full"
                          placeholder="?"
                        />
                        <span className="text-[11px] mt-4 text-[#c5a059] font-black tracking-widest">{getHangulStroke(nameInput[key]) || 0} 劃</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-8 mb-16">
                    {hanjaItems.map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <label className="text-[11px] text-stone-300 font-bold mb-4">{idx === 0 ? '姓 (성)' : `名 (명${idx})`}</label>
                        <button 
                          onClick={() => setCurSlot(idx)}
                          className={`w-full aspect-[4/5] flex flex-col items-center justify-center border-2 border-dashed rounded-[2rem] transition-all ${item ? 'border-[#8b2e2e] bg-[#8b2e2e]/5 shadow-inner' : 'border-stone-200 hover:border-[#c5a059]'}`}
                        >
                          <span className={`text-6xl font-black ${item ? 'text-[#8b2e2e]' : 'text-stone-200'}`}>{item ? item.h : '選'}</span>
                          {item && <span className="text-xs mt-3 text-stone-500 font-bold">{item.k}</span>}
                        </button>
                        <span className="text-[11px] mt-4 text-[#c5a059] font-black tracking-widest">{item?.s || 0} 劃</span>
                      </div>
                    ))}
                  </div>
                )}
                <button 
                  onClick={runAnalysis} 
                  disabled={isLoading}
                  className="premium-btn w-full py-7 font-black text-2xl shadow-2xl"
                >
                  {isLoading ? '운명을 해독 중입니다...' : '심층 분석 시작'}
                </button>
              </div>

              {/* 결과 리포트 섹션 */}
              <div id="result-section">
                {isAnalyzed && (
                  <div className="space-y-16 fade-in-up">
                    <div className="text-center">
                      <div className="h-px bg-gradient-to-r from-transparent via-[#c5a059] to-transparent mb-10"></div>
                      <h3 className="text-stone-900 font-black text-3xl tracking-tight">성명 감명 결과 보고서</h3>
                    </div>

                    <div className="oriental-card p-10 border-l-[10px] border-[#c5a059] bg-[#fdfaf5] shadow-2xl">
                      <h4 className="text-[#8b2e2e] text-2xl font-black mb-8 flex items-center gap-4">
                        <span className="w-12 h-px bg-[#8b2e2e]"></span>
                        자원오행 및 용신 심층 분석
                      </h4>
                      <div className="text-[16px] text-stone-700 leading-[2.2] font-medium whitespace-pre-wrap">
                        {aiAnalysis}
                      </div>
                    </div>

                    <div className="grid gap-12">
                      {results.map((res, i) => <LuckCard key={i} fortune={res} />)}
                    </div>
                  </div>
                )}
              </div>

              {/* 하단 상담 섹션 */}
              <section className="mt-48 p-14 bg-[#1a1a1a] rounded-[4rem] text-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden">
                <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#c5a059]/10 rounded-full blur-[120px]"></div>
                <div className="relative z-10">
                  <span className="text-[11px] text-[#c5a059] font-black tracking-[0.7em] uppercase mb-8 block">Exclusive Service</span>
                  <h2 className="text-5xl font-black mb-10 tracking-tighter">1:1 프리미엄 작명 상담</h2>
                  <p className="text-stone-400 text-base leading-[2.3] mb-14 font-medium">
                    단순한 이름 짓기를 넘어, 주역의 64괘와 사주 명리학의 <strong>용신(用神)</strong>을 완벽히 분석하여 평생의 복이 깃든 최고의 성명을 선사합니다.
                  </p>
                  
                  <form action="https://formspree.io/f/xpqjwjjw" method="POST" className="space-y-8">
                    <input 
                      type="text" name="name" required placeholder="신청자 성함"
                      className="w-full p-7 bg-white/5 rounded-3xl border border-white/10 focus:border-[#c5a059] outline-none text-lg transition-all"
                    />
                    <input 
                      type="tel" name="contact" required placeholder="연락처 (010-0000-0000)"
                      className="w-full p-7 bg-white/5 rounded-3xl border border-white/10 focus:border-[#c5a059] outline-none text-lg transition-all"
                    />
                    <button type="submit" className="w-full py-8 bg-[#c5a059] text-stone-900 font-black text-2xl rounded-3xl hover:brightness-110 shadow-3xl shadow-[#c5a059]/20 transition-all">
                      심층 상담 신청하기
                    </button>
                  </form>
                </div>
              </section>
            </main>
          </div>
        ) : (
          <div className="fade-in-up py-10 space-y-24">
            <div className="text-center">
              <h2 className="text-7xl font-black text-stone-900 mb-10 tracking-tighter">성명학 5대 원칙</h2>
              <p className="text-stone-500 italic text-xl">"전통 성명학의 정수를 명경에 담았습니다"</p>
            </div>
            <div className="grid gap-14">
              {[
                { t: "발음오행", d: "초성 소리가 서로 상생하는 기운을 갖추어야 인생의 장애가 적고 순탄하게 전진합니다." },
                { t: "발음음양", d: "획수의 홀수와 짝수가 조화를 이루어야 삶의 기복이 없으며 평화로운 가정을 이룹니다." },
                { t: "81수리", d: "원격, 형격, 이격, 정격의 수리가 모두 대길해야 평생의 복록을 온전히 누릴 수 있습니다." },
                { t: "자원오행", d: "한자가 가진 본질적인 기운이 사주에 부족한 에너지를 보충하여 운명을 개척하게 합니다." },
                { t: "용신분석", d: "기운의 흐름에서 가장 핵심인 용신을 찾아 성명에 녹여내야 비로소 완성된 이름이 됩니다." }
              ].map((item, i) => (
                <div key={i} className="oriental-card p-14 group">
                  <h4 className="text-4xl font-black text-[#8b2e2e] mb-8 flex items-center gap-6">
                    <span className="w-12 h-px bg-[#8b2e2e]"></span>
                    {item.t}
                  </h4>
                  <p className="text-stone-600 text-lg leading-[2.2] font-medium">{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="bg-white border-t border-stone-100 py-32 text-center">
        <h2 className="text-6xl font-black text-stone-900 tracking-[0.4em] mb-6">明鏡</h2>
        <p className="text-[#c5a059] text-[12px] font-black tracking-[0.8em] mb-20 uppercase">The Mirror of Destiny</p>
        <p className="text-stone-400 text-sm font-medium opacity-60">Copyright &copy; 2026 MyeongGyeong. All Rights Reserved.</p>
      </footer>

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
