
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { AnalysisMode, HanjaItem, FortuneResult } from './types';
import { getHangulStroke, analyzeFortune } from './services/strokeEngine';
import HanjaSelector from './components/HanjaSelector';
import LuckCard from './components/LuckCard';

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
    const baseResults = analyzeFortune(sStrokes, n1Strokes, n2Strokes, sChar, n1Char, n2Char);
    setResults(baseResults);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const fullName = mode === AnalysisMode.HANGUL ? `${nameInput.s}${nameInput.n1}${nameInput.n2}` : hanjaItems.map(h => h?.h).join('');
      const prompt = `성명학 전문가로서 다음 이름의 '자원오행'과 '용신분석'을 심층 분석해주세요. 
      이름: ${fullName} (${mode === AnalysisMode.HANGUL ? '한글' : '한자'})
      전문적이고 품격 있는 어조로 400자 내외의 리포트를 작성하세요. '자원오행'과 '용신' 키워드를 반드시 포함하세요.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setAiAnalysis(response.text || "분석 결과를 불러오는 중입니다.");
    } catch (e) {
      setAiAnalysis("심층 분석 서버가 혼잡하여 기본 수리 분석 결과를 먼저 확인해주세요.");
    }

    setIsLoading(false);
    setIsAnalyzed(true);
    setTimeout(() => document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' }), 300);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 프리미엄 상단 네비게이션 */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#c5a059]/20 h-20 flex items-center">
        <div className="max-w-md mx-auto w-full px-6 flex justify-between items-center">
          <button onClick={() => setView('main')} className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-[#8b2e2e] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg transition-transform group-hover:scale-105">明</div>
            <span className="text-2xl font-black text-stone-900 tracking-tighter">명경</span>
          </button>
          <div className="flex gap-6">
            <button onClick={() => setView('main')} className={`text-xs font-black tracking-widest ${view === 'main' ? 'text-[#8b2e2e]' : 'text-stone-400'}`}>운세분석</button>
            <button onClick={() => setView('guide')} className={`text-xs font-black tracking-widest ${view === 'guide' ? 'text-[#8b2e2e]' : 'text-stone-400'}`}>성명학 원칙</button>
          </div>
        </div>
      </nav>

      <div className="max-w-md mx-auto flex-1 w-full pb-32 pt-16 px-6">
        {view === 'main' ? (
          <div className="fade-in-up">
            <header className="text-center mb-16">
              <div className="inline-block px-4 py-1 border-y border-[#c5a059] mb-6">
                <span className="text-[10px] text-[#c5a059] font-black tracking-[0.5em] uppercase">The Art of Naming</span>
              </div>
              <h1 className="text-8xl font-black text-stone-900 tracking-tighter mb-4">明鏡</h1>
              <p className="text-stone-500 text-base font-medium italic">이름의 이치를 거울처럼 비추다</p>
            </header>

            {/* 모드 전환 */}
            <div className="flex p-1.5 bg-stone-100/50 rounded-[2.5rem] mb-12 border border-stone-200/50">
              <button onClick={() => setMode(AnalysisMode.HANGUL)} className={`flex-1 py-4 text-xs font-black rounded-[2rem] transition-all ${mode === AnalysisMode.HANGUL ? 'bg-white text-[#8b2e2e] shadow-lg' : 'text-stone-400'}`}>한글 이름 분석</button>
              <button onClick={() => setMode(AnalysisMode.HANJA)} className={`flex-1 py-4 text-xs font-black rounded-[2rem] transition-all ${mode === AnalysisMode.HANJA ? 'bg-white text-[#8b2e2e] shadow-lg' : 'text-stone-400'}`}>한자 이름 분석</button>
            </div>

            <main>
              {/* 입력 섹션 */}
              <div className="oriental-card p-10 mb-20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#8b2e2e] to-[#4a1c22]"></div>
                
                {mode === AnalysisMode.HANGUL ? (
                  <div className="grid grid-cols-3 gap-8 mb-12">
                    {(['s', 'n1', 'n2'] as const).map((key, idx) => (
                      <div key={key} className="flex flex-col items-center">
                        <label className="text-[11px] text-stone-300 font-black mb-3">{key === 's' ? '姓 (성)' : `名 (명${idx})`}</label>
                        <input 
                          type="text" value={nameInput[key]}
                          onChange={(e) => setNameInput(prev => ({ ...prev, [key]: e.target.value.substring(0, 1) }))}
                          className="input-field w-full"
                          placeholder="?"
                        />
                        <span className="text-[11px] mt-4 text-[#c5a059] font-black">{getHangulStroke(nameInput[key]) || 0} 劃</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-8 mb-12">
                    {hanjaItems.map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <label className="text-[11px] text-stone-300 font-black mb-3">{idx === 0 ? '姓 (성)' : `名 (명${idx})`}</label>
                        <button 
                          onClick={() => setCurSlot(idx)}
                          className={`w-full aspect-[4/5] flex flex-col items-center justify-center border-2 border-dashed rounded-3xl transition-all ${item ? 'border-[#8b2e2e] bg-[#8b2e2e]/5' : 'border-stone-200 hover:border-[#c5a059]'}`}
                        >
                          <span className={`text-5xl font-black ${item ? 'text-[#8b2e2e]' : 'text-stone-200'}`}>{item ? item.h : '選'}</span>
                          {item && <span className="text-[11px] mt-2 text-stone-500 font-bold">{item.k}</span>}
                        </button>
                        <span className="text-[11px] mt-4 text-[#c5a059] font-black">{item?.s || 0} 劃</span>
                      </div>
                    ))}
                  </div>
                )}
                <button 
                  onClick={runAnalysis} 
                  disabled={isLoading}
                  className="premium-btn w-full py-6 font-black text-xl disabled:opacity-50"
                >
                  {isLoading ? '운명 해독 중...' : '심층 분석 시작'}
                </button>
              </div>

              {/* 결과 섹션 */}
              <div id="result-section">
                {isAnalyzed && (
                  <div className="space-y-12 fade-in-up">
                    <div className="text-center">
                      <div className="h-px bg-gradient-to-r from-transparent via-[#c5a059] to-transparent mb-8"></div>
                      <h3 className="text-stone-900 font-black text-2xl tracking-tight">성명 감명 결과 보고서</h3>
                    </div>

                    {/* AI 심층 리포트 */}
                    <div className="oriental-card p-10 border-l-[8px] border-[#c5a059] bg-[#fdfaf5]">
                      <h4 className="text-[#8b2e2e] text-xl font-black mb-6 flex items-center gap-3">
                        <span className="w-10 h-px bg-[#8b2e2e]"></span>
                        자원오행 및 용신 심층 분석
                      </h4>
                      <div className="text-[15px] text-stone-600 leading-[2.1] font-medium whitespace-pre-wrap">
                        {isLoading ? "분석 중..." : aiAnalysis}
                      </div>
                    </div>

                    {/* 엔진 분석 결과 카드들 */}
                    <div className="grid gap-10">
                      {results.map((res, i) => <LuckCard key={i} fortune={res} />)}
                    </div>
                  </div>
                )}
              </div>

              {/* 하단 상담 섹션 */}
              <section className="mt-40 p-12 bg-[#1a1a1a] rounded-[4rem] text-white shadow-3xl relative overflow-hidden border border-white/5">
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#c5a059]/15 rounded-full blur-[100px]"></div>
                <div className="relative z-10">
                  <span className="text-[10px] text-[#c5a059] font-black tracking-[0.6em] uppercase mb-6 block">Professional Service</span>
                  <h2 className="text-4xl font-black mb-8 tracking-tighter">1:1 프리미엄 작명 상담</h2>
                  <p className="text-stone-400 text-sm leading-[2.2] mb-12">
                    단순한 이름 짓기를 넘어, 주역의 64괘와 사주 명리학의 <strong>용신(用神)</strong>을 완벽히 분석하여 평생의 복이 깃든 최고의 성명을 선사합니다. 명경 원장이 직접 모든 과정을 주관합니다.
                  </p>
                  
                  <form action="https://formspree.io/f/xpqjwjjw" method="POST" className="space-y-6">
                    <input 
                      type="text" name="name" required placeholder="신청자 성함"
                      className="w-full p-6 bg-white/5 rounded-2xl border border-white/10 focus:border-[#c5a059] outline-none text-base"
                    />
                    <input 
                      type="tel" name="contact" required placeholder="연락처 (010-0000-0000)"
                      className="w-full p-6 bg-white/5 rounded-2xl border border-white/10 focus:border-[#c5a059] outline-none text-base"
                    />
                    <button type="submit" className="w-full py-7 bg-[#c5a059] text-stone-900 font-black text-xl rounded-2xl hover:brightness-110 shadow-xl">
                      상담 신청하기
                    </button>
                  </form>
                </div>
              </section>
            </main>
          </div>
        ) : (
          <div className="fade-in-up py-10 space-y-20">
            <div className="text-center">
              <h2 className="text-6xl font-black text-stone-900 mb-8 tracking-tighter">성명학 5대 원칙</h2>
              <p className="text-stone-500 italic">"전통의 이치를 정직하게 지킵니다"</p>
            </div>
            <div className="grid gap-12">
              {[
                { t: "발음오행", d: "초성 소리가 상생하는 기운을 갖추어야 인생의 장애가 적습니다." },
                { t: "발음음양", d: "획수의 홀짝 조화가 우주의 질서를 이루어야 삶의 기복이 없습니다." },
                { t: "81수리", d: "수리가 대길한 수여야 평생의 복록을 온전히 누릴 수 있습니다." },
                { t: "자원오행", d: "한자의 본질 기운이 사주에 부족한 에너지를 보충해야 합니다." },
                { t: "용신분석", d: "기운의 핵심인 용신을 찾아 성명에 완벽히 녹여내야 합니다." }
              ].map((item, i) => (
                <div key={i} className="oriental-card p-12">
                  <h4 className="text-3xl font-black text-[#8b2e2e] mb-5">{item.t}</h4>
                  <p className="text-stone-600 text-base leading-[2.1] font-medium">{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="bg-white border-t border-stone-100 py-24 text-center">
        <h2 className="text-4xl font-black text-stone-900 tracking-[0.3em] mb-4">明鏡</h2>
        <p className="text-[#c5a059] text-[11px] font-black tracking-[0.6em] mb-16 uppercase">The Mirror of Destiny</p>
        <p className="text-stone-400 text-xs">Copyright &copy; 2026 MyeongGyeong. All Rights Reserved.</p>
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
    </div>
  );
};

export default App;
