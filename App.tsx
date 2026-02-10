import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { AnalysisMode, HanjaItem, FortuneResult } from './types';
import { getHangulStroke, analyzeFortune } from './services/strokeEngine';
import HanjaSelector from './components/HanjaSelector';
import LuckCard from './components/LuckCard';
import AdInterstitial from './components/AdInterstitial';

const App: React.FC = () => {
  const [mode, setMode] = useState<AnalysisMode>(AnalysisMode.HANGUL);
  const [view, setView] = useState<'main' | 'guide' | 'consult'>('main');
  
  const [nameInput, setNameInput] = useState({ s: '', n1: '', n2: '' });
  const [hanjaItems, setHanjaItems] = useState<(HanjaItem | null)[]>([null, null, null]);
  const [curSlot, setCurSlot] = useState<number | null>(null);
  
  const [results, setResults] = useState<FortuneResult[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAd, setShowAd] = useState(false);

  // 분석 횟수 카운팅 (5회당 1회 광고)
  const incrementCount = () => {
    const count = parseInt(localStorage.getItem('mg_analysis_count') || '0') + 1;
    localStorage.setItem('mg_analysis_count', count.toString());
    return count;
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
    
    // 분석 횟수 체크
    const count = incrementCount();
    if (count % 5 === 0) {
      setShowAd(true);
    }

    const baseResults = analyzeFortune(sStrokes, n1Strokes, n2Strokes, sChar, n1Char, n2Char);
    setResults(baseResults);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const fullName = mode === AnalysisMode.HANGUL ? `${nameInput.s}${nameInput.n1}${nameInput.n2}` : hanjaItems.map(h => h?.h).join('');
      
      const prompt = `당신은 대한민국 최고의 정통 주역 성명학 권위자입니다. 다음 이름 '${fullName}'에 대해 전문가 수준의 심층 분석 리포트를 작성해 주세요. 
      분석 시 다음 5대 핵심 요소를 반드시 전문적으로 다뤄주세요:
      1. 발음오행: 소리의 상생/상극이 만드는 대인관계와 사회적 명망
      2. 발음음양: 획수의 음양 조화가 선사하는 삶의 안정성과 굴곡
      3. 81수리: 원형이정(元亨利貞) 4격이 삶의 주기(초년, 중년, 장년, 노년)에 미치는 영향
      4. 자원오행 제언: 한자의 근원적 에너지가 사주의 부족한 기운을 어떻게 보완할 수 있는지
      5. 용신분석 기반 운세: 이름이 가진 '재물운', '금전운', '성공운'에 미치는 파동과 잠재력을 상세히 기술
      문체는 매우 격조 있고 정중하게 작성하며, 사용자가 삶의 희망을 발견할 수 있도록 품위 있는 언어를 사용해 주세요. 특히 '재물운'에 대해 희망적인 메시지를 담아주세요.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setAiAnalysis(response.text || "분석 리포트를 생성하는 중 오류가 발생했습니다.");
    } catch (e) {
      setAiAnalysis("AI 분석 기능을 일시적으로 사용할 수 없습니다. 기본 분석 수치를 참고해 주세요.");
    }
    
    if (count % 5 !== 0) {
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
      {/* 고정 헤더 - 스타일 정밀 조정 */}
      <nav className="sticky top-0 z-40 bg-brand-paper/90 backdrop-blur-lg h-16 flex items-center justify-between px-6 border-b border-brand-gold/10 shadow-sm">
        <button onClick={() => setView('main')} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white text-sm font-black">明</span>
          </div>
          <span className="text-brand-ink text-lg font-black tracking-tighter">명경</span>
        </button>
        <div className="hidden md:flex gap-8">
          <button onClick={() => setView('main')} className={`text-xs font-black transition-colors hover:text-brand-red ${view === 'main' ? 'text-brand-red underline underline-offset-8 decoration-2' : 'text-stone-400'}`}>홈</button>
          <button onClick={() => setView('guide')} className={`text-xs font-black transition-colors hover:text-brand-red ${view === 'guide' ? 'text-brand-red underline underline-offset-8 decoration-2' : 'text-stone-400'}`}>성명학 원리</button>
          <button onClick={() => setView('consult')} className={`text-xs font-black transition-colors hover:text-brand-red ${view === 'consult' ? 'text-brand-red underline underline-offset-8 decoration-2' : 'text-stone-400'}`}>VIP 상담</button>
        </div>
      </nav>

      <div className="max-w-md mx-auto flex-1 w-full pb-32 pt-10 px-6">
        {view === 'main' && (
          <div className="fade-in-up">
            <header className="text-center mb-12">
              <span className="text-[10px] text-brand-gold font-black tracking-[0.4em] uppercase mb-3 block">Premium Destiny Report</span>
              <h1 className="text-6xl font-black text-brand-ink tracking-tighter mb-4">명경<span className="text-brand-red">.</span></h1>
              <p className="text-stone-500 text-sm font-medium leading-relaxed italic">거울처럼 맑은 지혜로<br/>당신의 이름 속에 숨겨진 운명을 비춥니다</p>
            </header>

            <div className="flex bg-stone-100 p-1 rounded-2xl mb-10">
              <button onClick={() => setMode(AnalysisMode.HANGUL)} className={`flex-1 py-3.5 rounded-xl text-xs font-black transition-all ${mode === AnalysisMode.HANGUL ? 'bg-white text-brand-red shadow-sm' : 'text-stone-500'}`}>한글 분석</button>
              <button onClick={() => setMode(AnalysisMode.HANJA)} className={`flex-1 py-3.5 rounded-xl text-xs font-black transition-all ${mode === AnalysisMode.HANJA ? 'bg-white text-brand-red shadow-sm' : 'text-stone-500'}`}>한자 분석</button>
            </div>

            <main>
              <div className="premium-oriental-card p-10 mb-20 bg-white">
                <div className="grid grid-cols-3 gap-2 mb-16 relative">
                  {(mode === AnalysisMode.HANGUL ? ['s', 'n1', 'n2'] : [0, 1, 2]).map((key, idx) => (
                    <div key={idx} className="relative flex flex-col items-center">
                      <div className="bg-label-text opacity-[0.05] select-none">{idx === 0 ? '姓' : idx === 1 ? '名' : '字'}</div>
                      <div className="w-full relative z-10">
                        {mode === AnalysisMode.HANGUL ? (
                          <input 
                            type="text"
                            value={nameInput[key as 's'|'n1'|'n2']}
                            onChange={(e) => setNameInput(prev => ({ ...prev, [key]: e.target.value.substring(0,1) }))}
                            className="input-premium cursor-text"
                            placeholder="?"
                          />
                        ) : (
                          <button 
                            onClick={() => setCurSlot(idx)}
                            className="input-premium min-h-[120px] flex items-center justify-center hover:bg-stone-50 rounded-2xl transition-all"
                          >
                            {hanjaItems[idx] ? hanjaItems[idx]!.h : '?'}
                          </button>
                        )}
                        <div className="input-border"></div>
                      </div>
                      <span className="stroke-count-text">
                        {(mode === AnalysisMode.HANGUL ? getHangulStroke(nameInput[key as 's'|'n1'|'n2']) : hanjaItems[idx]?.s) || 0} 획
                      </span>
                    </div>
                  ))}
                </div>

                <button onClick={runAnalysis} disabled={isLoading} className="btn-destiny active:scale-95">
                  {isLoading ? '운명 지도를 그리는 중...' : '운명 리포트 생성'}
                </button>
              </div>

              <div id="result-section">
                {isAnalyzed && (
                  <div className="space-y-12 fade-in-up">
                    <div className="bg-white rounded-[2.5rem] p-10 border-t-[10px] border-brand-gold shadow-xl relative">
                      <div className="absolute top-6 right-8 text-brand-gold opacity-10 font-black text-6xl italic select-none">評</div>
                      <h4 className="text-brand-red text-xl font-black mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-brand-red rounded-full"></span>
                        AI 전문 성명 감정서
                      </h4>
                      <p className="text-stone-700 leading-loose text-base font-medium whitespace-pre-wrap">{aiAnalysis}</p>
                    </div>
                    <div className="grid gap-8">
                      {results.map((res, i) => <LuckCard key={i} fortune={res} />)}
                    </div>
                    
                    {/* 상담 유도 섹션 고정 */}
                    <div className="bg-brand-ink text-white rounded-[2.5rem] p-10 shadow-2xl mt-20 relative overflow-hidden border border-brand-gold/20">
                      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-brand-red/10 rounded-full blur-3xl"></div>
                      <span className="text-brand-gold text-[10px] font-black tracking-widest uppercase mb-4 block">1:1 Premium Service</span>
                      <h3 className="text-2xl font-black mb-4 tracking-tighter">당신만을 위한 이름, '명경'이 짓습니다.</h3>
                      <div className="space-y-2 mb-8">
                        <p className="text-stone-400 text-sm leading-relaxed">단순 수치 분석을 넘어 사주와 조화를 이루는 최고의 이름을 제안합니다.</p>
                        <div className="flex flex-wrap gap-2 pt-2">
                           {["발음오행", "발음음양", "81수리", "자원오행", "용신분석"].map(tag => (
                             <span key={tag} className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded-md text-brand-gold font-bold">#{tag}</span>
                           ))}
                        </div>
                      </div>
                      <button onClick={() => setView('consult')} className="w-full py-4 bg-brand-gold text-brand-ink font-black rounded-xl text-sm shadow-lg hover:bg-white transition-all transform active:scale-95">
                        프리미엄 상담 예약하기
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </main>
          </div>
        )}

        {view === 'guide' && (
          <div className="fade-in-up space-y-12 py-6">
            <h2 className="text-4xl font-black text-brand-ink tracking-tighter border-b-2 border-brand-red inline-block pb-2">성명학의 원리</h2>
            <div className="grid gap-8">
              {[
                {t: "발음오행(發音五行)", d: "이름 소리의 첫 자음이 가진 기운이 서로 상생하는지 상극하는지 분석합니다. 대인관계와 사회적 명망을 결정짓는 핵심 요소입니다."},
                {t: "발음음양(發音陰陽)", d: "획수의 홀수(양)와 짝수(음)가 적절히 섞여야 조화로운 삶을 삽니다. 지나친 양이나 음은 인생의 굴곡을 만듭니다."},
                {t: "81수리(81數理)", d: "주역의 원리를 숫자에 대입하여 초년, 중년, 장년, 총운의 길흉을 판별합니다. 성명학의 가장 기본이 되는 분석법입니다."},
                {t: "자원오행 & 용신(用神)", d: "사주에 부족한 기운을 한자 자체가 가진 오행(자원오행)으로 보강하는 고도의 기법입니다. 프리미엄 작명 상담의 핵심입니다."}
              ].map((item, i) => (
                <div key={i} className="premium-oriental-card p-10 bg-white shadow-md">
                  <h4 className="text-lg font-black text-brand-red mb-4">{item.t}</h4>
                  <p className="text-stone-600 text-sm leading-relaxed font-medium">{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'consult' && (
          <div className="fade-in-up py-6">
             <header className="mb-12">
               <span className="text-brand-gold font-black text-[10px] tracking-widest uppercase mb-2 block">Premium Consultation</span>
               <h2 className="text-4xl font-black text-brand-ink tracking-tighter">1:1 프리미엄 작명 상담</h2>
               <p className="text-stone-500 text-sm mt-4 leading-relaxed font-medium italic">
                 "이름은 불려질 때마다 생기는 운명의 파동입니다."<br/>
                 평생 당신을 지켜줄 귀한 이름을 정통 원리로 선사합니다.
               </p>
             </header>

             <div className="bg-brand-paper rounded-3xl p-8 mb-10 border border-brand-gold/20 shadow-inner">
               <h4 className="font-black text-brand-red mb-6 text-sm underline underline-offset-4 decoration-brand-gold">VIP 제공 서비스 내역</h4>
               <ul className="space-y-4 text-xs font-bold text-stone-700">
                 <li className="flex items-center gap-3">
                   <span className="text-brand-gold text-lg">✦</span> 
                   <span>정통 <span className="text-brand-red">발음오행</span> 및 <span className="text-brand-red">발음음양</span> 심층 조화 분석</span>
                 </li>
                 <li className="flex items-center gap-3">
                   <span className="text-brand-gold text-lg">✦</span> 
                   <span><span className="text-brand-red">81수리</span> 원형이정(元亨利貞) 4격 완성 시스템 적용</span>
                 </li>
                 <li className="flex items-center gap-3">
                   <span className="text-brand-gold text-lg">✦</span> 
                   <span>부족한 기운을 채우는 정밀 <span className="text-brand-red">자원오행(字源五行)</span> 배치</span>
                 </li>
                 <li className="flex items-center gap-3">
                   <span className="text-brand-gold text-lg">✦</span> 
                   <span>억부/조후 기반 개인 맞춤형 <span className="text-brand-red">용신(用神)</span> 정밀 판별</span>
                 </li>
                 <li className="flex items-center gap-3">
                   <span className="text-brand-gold text-lg">✦</span> 
                   <span>주역 64괘 기반 총운 리포트 및 작명 인증서 발송</span>
                 </li>
               </ul>
             </div>

             <form action="https://formspree.io/f/xpqjwjjw" method="POST" className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <input name="name" required placeholder="상담자 성함" className="p-4 bg-white rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-brand-red/20 font-bold text-sm shadow-sm" />
                 <input name="phone" required placeholder="휴대폰 번호" className="p-4 bg-white rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-brand-red/20 font-bold text-sm shadow-sm" />
               </div>
               <textarea name="memo" rows={4} placeholder="생년월일 및 태어난 시간, 고민 내용을 적어주세요." className="w-full p-4 bg-white rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-brand-red/20 font-bold text-sm resize-none shadow-sm"></textarea>
               <button type="submit" className="w-full py-5 bg-brand-red text-white font-black rounded-xl text-base shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                 프리미엄 상담 예약하기
               </button>
             </form>
          </div>
        )}

        {/* 하단 정보 섹션 */}
        <footer className="mt-40 border-t border-stone-200 pt-16 pb-12 text-center bg-white/50">
          <div className="flex justify-center gap-8 text-[9px] font-black text-stone-400 tracking-widest uppercase mb-10">
            <button className="hover:text-brand-red transition-colors">이용약관</button>
            <button className="hover:text-brand-red transition-colors">개인정보처리방침</button>
            <button className="hover:text-brand-red transition-colors">고객센터</button>
          </div>
          <p className="text-[10px] text-stone-400 font-bold leading-loose max-w-xs mx-auto">
            © 2024 MYEONGGYEONG PROJECT. ALL RIGHTS RESERVED.<br/>
            본 서비스는 정통 성명학 원리를 기반으로 한 AI 분석 리포트입니다.<br/>
            모든 분석 결과는 성명학적 가이드라인이며, 중요한 결정은 반드시 전문가 상담을 권장합니다.
          </p>
          <div className="mt-8 flex justify-center gap-2 opacity-20">
             <div className="w-8 h-1 bg-stone-300 rounded-full"></div>
             <div className="w-4 h-1 bg-stone-300 rounded-full"></div>
          </div>
        </footer>
      </div>

      {/* 모바일 하단 탭 바 */}
      <div className="mobile-nav md:hidden border-t border-stone-100 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)] bg-white/95">
        <button onClick={() => setView('main')} className={`flex flex-col items-center gap-1 transition-all ${view === 'main' ? 'text-brand-red scale-110' : 'text-stone-300'}`}>
          <div className="text-xl">{view === 'main' ? '⛩️' : '🏠'}</div>
          <span className="text-[9px] font-black uppercase tracking-tighter">홈</span>
        </button>
        <button onClick={() => setView('guide')} className={`flex flex-col items-center gap-1 transition-all ${view === 'guide' ? 'text-brand-red scale-110' : 'text-stone-300'}`}>
          <div className="text-xl">📜</div>
          <span className="text-[9px] font-black uppercase tracking-tighter">원리</span>
        </button>
        <button onClick={() => setView('consult')} className={`flex flex-col items-center gap-1 transition-all ${view === 'consult' ? 'text-brand-red scale-110' : 'text-stone-300'}`}>
          <div className="text-xl">💎</div>
          <span className="text-[9px] font-black uppercase tracking-tighter">상담</span>
        </button>
      </div>

      {curSlot !== null && (
        <HanjaSelector 
          title={curSlot === 0 ? "성씨" : `이름 ${curSlot === 1 ? '첫' : '끝'}자`} 
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