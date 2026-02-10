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
  const [loadingMsg, setLoadingMsg] = useState('');
  const [showAd, setShowAd] = useState(false);

  const loadingMessages = [
    "성명의 파동을 정밀 분석하고 있습니다...",
    "주역 64괘와 81수리를 대조하는 중입니다...",
    "우주의 기운을 문장으로 치환하고 있습니다...",
    "당신의 운명 지도를 세밀하게 그리고 있습니다...",
    "거울처럼 맑은 지혜를 모으는 중입니다..."
  ];

  useEffect(() => {
    let timer: any;
    if (isLoading) {
      let idx = 0;
      setLoadingMsg(loadingMessages[0]);
      timer = setInterval(() => {
        idx = (idx + 1) % loadingMessages.length;
        setLoadingMsg(loadingMessages[idx]);
      }, 3000); // 3초 간격으로 로딩 메시지 순환
    }
    return () => clearInterval(timer);
  }, [isLoading]);

  const incrementCount = () => {
    const count = parseInt(localStorage.getItem('mg_analysis_count') || '0') + 1;
    localStorage.setItem('mg_analysis_count', count.toString());
    return count;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  /**
   * 한글 입력 핸들러: 
   * IME 조합 중 글자가 끊기지 않도록 마지막 완성/조합 중인 문자만 안전하게 추출합니다.
   * input 태그의 maxLength={2} 설정과 결합되어 조합 버퍼를 허용하면서도 최종 1글자만 상태에 저장합니다.
   */
  const handleHangulInput = (key: 's' | 'n1' | 'n2', val: string) => {
    // 입력값에서 가장 마지막 글자(덩어리)만 취하여 상태 업데이트 (IME 조합 버퍼 유지용)
    const latestChar = val.length > 0 ? val.slice(-1) : "";
    setNameInput(prev => ({ ...prev, [key]: latestChar }));
  };

  const runAnalysis = async () => {
    let sStrokes = 0, n1Strokes = 0, n2Strokes = 0;
    let sChar = '', n1Char = '', n2Char = '';

    if (mode === AnalysisMode.HANGUL) {
      // 분석 직전 공백 제거 및 문자 확정
      const sVal = nameInput.s.trim();
      const n1Val = nameInput.n1.trim();
      const n2Val = nameInput.n2.trim();

      // 성함 3글자가 모두 공백 없이 채워졌는지 엄격히 체크
      if (sVal.length === 0 || n1Val.length === 0 || n2Val.length === 0) { 
        alert("성함 3글자를 모두 빈칸 없이 입력해 주세요. (성, 이름 첫자, 이름 끝자)"); 
        return; 
      }
      
      // 혹시라도 여러 글자가 입력된 경우를 대비해 마지막 글자만 분석 대상으로 삼음
      sChar = sVal.slice(-1);
      n1Char = n1Val.slice(-1);
      n2Char = n2Val.slice(-1);

      sStrokes = getHangulStroke(sChar);
      n1Strokes = getHangulStroke(n1Char);
      n2Strokes = getHangulStroke(n2Char);
    } else {
      if (hanjaItems.some(x => x === null)) { 
        alert("한자 3자를 모두 선택해 주세요."); 
        return; 
      }
      sStrokes = hanjaItems[0]!.s; 
      n1Strokes = hanjaItems[1]!.s; 
      n2Strokes = hanjaItems[2]!.s;
      sChar = hanjaItems[0]!.k; 
      n1Char = hanjaItems[1]!.k; 
      n2Char = hanjaItems[2]!.k;
    }

    setIsLoading(true);
    setAiAnalysis(null);
    setIsAnalyzed(false);
    
    const count = incrementCount();
    const shouldShowAd = count % 5 === 0;

    const baseResults = analyzeFortune(sStrokes, n1Strokes, n2Strokes, sChar, n1Char, n2Char);
    setResults(baseResults);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const fullName = mode === AnalysisMode.HANGUL 
        ? `${sChar}${n1Char}${n2Char}` 
        : hanjaItems.map(h => h?.h).join('');
      
      const prompt = `당신은 대한민국 최고의 정통 주역 성명학 권위자입니다. 다음 이름 '${fullName}'에 대해 전문가 수준의 심층 분석 리포트를 작성해 주세요. 
      분석 시 다음 5대 핵심 요소를 반드시 전문적으로 다뤄주세요:
      1. 발음오행: 소리의 파동(상생/상극)이 사회적 평판, 대인관계의 질, 그리고 외부로부터 오는 기회에 미치는 영향.
      2. 발음음양: 획수의 음양 균형이 심리적 안정성과 인생의 굴곡을 어떻게 조율하는지.
      3. 81수리 원형이정(元亨利貞): 초년(원격), 중년(형격), 장년(이격), 총운(정격)의 4격 수리가 인생 주기별로 가져올 구체적인 변화와 성취.
      4. 재물운 및 사회적 성공: 성명의 기운이 금전의 유입과 보존, 그리고 직업적 명망에 미치는 긍정적 파동을 매우 상세하고 희망적으로 기술.
      5. 종합 제언: 자원오행의 관점에서 부족한 기운을 일상에서 어떻게 보충할 수 있는지(행운의 색상, 행운의 방향 등).

      문체는 매우 격조 있고 정중하며, 사용자가 자신의 삶에 대해 깊은 자부심과 희망을 느낄 수 있도록 우아하고 품위 있는 언어를 사용해 주세요.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setAiAnalysis(response.text || "분석 리포트를 생성하는 중 오류가 발생했습니다.");
    } catch (e) {
      console.error(e);
      setAiAnalysis("AI 분석 기능을 일시적으로 사용할 수 없습니다. 하단의 기본 수리 분석 결과를 참고해 주세요.");
    }
    
    setIsLoading(false);

    if (shouldShowAd) {
      setShowAd(true);
    } else {
      setIsAnalyzed(true);
      setTimeout(() => {
        const resultSection = document.getElementById('result-section');
        if (resultSection) resultSection.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  const handleCloseAd = () => {
    setShowAd(false);
    setIsAnalyzed(true);
    setTimeout(() => {
      const resultSection = document.getElementById('result-section');
      if (resultSection) resultSection.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 로딩 인디케이터 오버레이 */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-brand-paper/90 backdrop-blur-md flex flex-col items-center justify-center p-10 animate-fade-in text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 border-4 border-brand-gold/20 border-t-brand-red rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-brand-red font-black text-xl">明</span>
            </div>
          </div>
          <p className="text-brand-ink font-black text-lg text-center animate-pulse h-8 transition-all duration-700">{loadingMsg}</p>
          <p className="text-stone-400 text-xs mt-4">정밀한 분석을 위해 잠시만 기다려주세요.</p>
        </div>
      )}

      {/* 고정 헤더 */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl h-16 flex items-center justify-between px-6 border-b border-stone-100 shadow-[0_1px_10px_rgba(0,0,0,0.02)] transition-all">
        <button onClick={() => setView('main')} className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
            <span className="text-white text-sm font-black">明</span>
          </div>
          <span className="text-brand-ink text-lg font-black tracking-tighter">명경</span>
        </button>
        <div className="hidden md:flex gap-10 items-center">
          <button onClick={() => setView('main')} className={`text-[11px] font-black tracking-widest uppercase transition-colors hover:text-brand-red ${view === 'main' ? 'text-brand-red' : 'text-stone-400'}`}>HOME</button>
          <button onClick={() => setView('guide')} className={`text-[11px] font-black tracking-widest uppercase transition-colors hover:text-brand-red ${view === 'guide' ? 'text-brand-red' : 'text-stone-400'}`}>PRINCIPLE</button>
          <button onClick={() => setView('consult')} className={`px-4 py-2 bg-brand-red/5 text-brand-red text-[11px] font-black rounded-full tracking-widest uppercase transition-all hover:bg-brand-red hover:text-white`}>CONSULTING</button>
        </div>
      </nav>

      <div className="max-w-md mx-auto flex-1 w-full pb-32 pt-10 px-6">
        {view === 'main' && (
          <div className="fade-in-up">
            <header className="text-center mb-16">
              <span className="text-[10px] text-brand-gold font-black tracking-[0.5em] uppercase mb-4 block animate-pulse">Destiny Reveal</span>
              <h1 className="text-7xl font-black text-brand-ink tracking-tighter mb-6">명경<span className="text-brand-red">.</span></h1>
              <p className="text-stone-400 text-sm font-medium leading-relaxed italic max-w-[240px] mx-auto">거울처럼 맑은 지혜로 당신의 이름 속에 숨겨진 운명을 비춥니다</p>
            </header>

            <div className="flex bg-stone-100 p-1.5 rounded-2xl mb-12 shadow-inner">
              <button onClick={() => setMode(AnalysisMode.HANGUL)} className={`flex-1 py-4 rounded-xl text-[11px] font-black transition-all tracking-wider ${mode === AnalysisMode.HANGUL ? 'bg-white text-brand-red shadow-sm' : 'text-stone-400'}`}>한글 분석</button>
              <button onClick={() => setMode(AnalysisMode.HANJA)} className={`flex-1 py-4 rounded-xl text-[11px] font-black transition-all tracking-wider ${mode === AnalysisMode.HANJA ? 'bg-white text-brand-red shadow-sm' : 'text-stone-400'}`}>한자 분석</button>
            </div>

            <main>
              <div className="premium-oriental-card p-12 mb-20 bg-white shadow-2xl relative">
                <div className="absolute top-4 right-4 text-[8px] font-black text-stone-300 tracking-widest uppercase opacity-50">Traditional Logic V3</div>
                <div className="grid grid-cols-3 gap-4 mb-16 relative">
                  {(mode === AnalysisMode.HANGUL ? ['s', 'n1', 'n2'] : [0, 1, 2]).map((key, idx) => (
                    <div key={idx} className="relative flex flex-col items-center">
                      <div className="bg-label-text opacity-[0.02] select-none">{idx === 0 ? '姓' : idx === 1 ? '名' : '字'}</div>
                      <div className="w-full relative z-10">
                        {mode === AnalysisMode.HANGUL ? (
                          <input 
                            type="text"
                            maxLength={2}
                            value={nameInput[key as 's'|'n1'|'n2']}
                            onChange={(e) => handleHangulInput(key as 's'|'n1'|'n2', e.target.value)}
                            className="input-premium cursor-text transition-all hover:scale-105 focus:scale-105"
                            placeholder="?"
                          />
                        ) : (
                          <button 
                            onClick={() => setCurSlot(idx)}
                            className="input-premium min-h-[140px] flex items-center justify-center hover:bg-stone-50 rounded-3xl transition-all"
                          >
                            {hanjaItems[idx] ? hanjaItems[idx]!.h : '?'}
                          </button>
                        )}
                        <div className="input-border"></div>
                      </div>
                      <span className="stroke-count-text">
                        {(mode === AnalysisMode.HANGUL ? getHangulStroke(nameInput[key as 's'|'n1'|'n2'].slice(-1)) : hanjaItems[idx]?.s) || 0} 획
                      </span>
                    </div>
                  ))}
                </div>

                <button onClick={runAnalysis} disabled={isLoading} className="btn-destiny active:scale-95 group">
                  <span className="relative z-10">{isLoading ? '운명 해독 중...' : '운명 리포트 생성'}</span>
                </button>
                <p className="text-[10px] text-stone-400 text-center mt-6 font-medium">※ 성명학 엑셀 로직 및 주역 64괘 분석 엔진 탑재</p>
              </div>

              <div id="result-section">
                {isAnalyzed && (
                  <div className="space-y-16 fade-in-up">
                    {aiAnalysis && (
                      <div className="bg-white rounded-[3rem] p-12 border-t-[12px] border-brand-red shadow-2xl relative overflow-hidden">
                        <div className="absolute top-10 right-10 text-brand-gold opacity-[0.05] font-black text-8xl italic select-none">鑑定</div>
                        <h4 className="text-brand-red text-xl font-black mb-8 flex items-center gap-3">
                          <span className="w-2 h-8 bg-brand-gold rounded-full"></span>
                          AI 전문 성명 감정서
                        </h4>
                        <div className="text-stone-700 leading-loose text-base font-medium whitespace-pre-wrap analysis-content">
                          {aiAnalysis}
                        </div>
                      </div>
                    )}
                    <div className="grid gap-10">
                      {results.map((res, i) => <LuckCard key={i} fortune={res} />)}
                    </div>
                    
                    <div className="bg-brand-ink text-white rounded-[3rem] p-12 shadow-2xl mt-24 relative overflow-hidden border border-brand-gold/10">
                      <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-brand-red/10 rounded-full blur-[100px]"></div>
                      <span className="text-brand-gold text-[10px] font-black tracking-[0.4em] uppercase mb-6 block">Premium 1:1 Care</span>
                      <h3 className="text-3xl font-black mb-6 tracking-tighter leading-tight">평생을 함께할 귀한 성명,<br/>명경이 정성으로 짓습니다.</h3>
                      <button onClick={() => setView('consult')} className="w-full py-5 bg-brand-gold text-brand-ink font-black rounded-2xl text-sm shadow-xl hover:bg-white transition-all transform active:scale-95">
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
          <div className="fade-in-up space-y-16 py-8">
            <div className="text-center space-y-4">
              <span className="text-[10px] text-brand-gold font-black tracking-widest uppercase">The Ancient Wisdom</span>
              <h2 className="text-5xl font-black text-brand-ink tracking-tighter">성명학의 원리</h2>
            </div>
            <div className="grid gap-10">
              {[
                {t: "발음오행(發音五行)", d: "이름 소리의 파동이 우주의 기운과 공명하는 원리입니다. 상생의 기운은 인생의 길목마다 귀인을 만나게 합니다."},
                {t: "발음음양(發音陰陽)", d: "홀수와 짝수의 수리적 조화가 삶의 굴곡을 결정합니다. 치우침 없는 조화는 평탄한 삶의 기반이 됩니다."},
                {t: "81수리(81數理)", d: "획수의 조합으로 인생의 사계절(원형이정)을 예측합니다. 각각의 단계는 운명의 고비마다 중요한 지표가 됩니다."},
                {t: "자원오행(字源五行)", d: "한자의 본질적인 의미가 사주의 부족함을 채워줍니다. 정통 작명에서 가장 정교한 분석 단계입니다."}
              ].map((item, i) => (
                <div key={i} className="premium-oriental-card p-12 bg-white shadow-xl hover:scale-[1.02] transition-transform">
                  <h4 className="text-xl font-black text-brand-red mb-6">{item.t}</h4>
                  <p className="text-stone-500 text-sm leading-relaxed font-medium">{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'consult' && (
          <div className="fade-in-up py-8">
             <header className="mb-16 text-center space-y-4">
               <span className="text-brand-gold font-black text-[10px] tracking-[0.5em] uppercase block">Exclusive Service</span>
               <h2 className="text-5xl font-black text-brand-ink tracking-tighter">1:1 프리미엄 작명</h2>
             </header>

             <div className="bg-brand-paper rounded-[3rem] p-10 mb-12 border border-brand-gold/10 shadow-inner space-y-8">
               <h4 className="font-black text-brand-red text-sm flex items-center gap-2">
                 <span className="w-1.5 h-4 bg-brand-gold"></span>
                 VIP 제공 서비스 내역
               </h4>
               <ul className="space-y-5 text-[13px] font-bold text-stone-700">
                 <li className="flex items-center gap-4"><span className="text-brand-gold">✦</span><span>정통 발음오행 및 발음음양 심층 조화 분석</span></li>
                 <li className="flex items-center gap-4"><span className="text-brand-gold">✦</span><span>81수리 원형이정(元亨利貞) 4격 완성 시스템</span></li>
                 <li className="flex items-center gap-4"><span className="text-brand-gold">✦</span><span>사주 용신 기반 맞춤형 자원오행 배치</span></li>
                 <li className="flex items-center gap-4"><span className="text-brand-gold">✦</span><span>평생 소장용 프리미엄 작명 인증서 발송</span></li>
               </ul>
             </div>

             <form action="https://formspree.io/f/xpqjwjjw" method="POST" className="space-y-6">
               <div className="grid grid-cols-2 gap-6">
                 <input name="name" required placeholder="상담자 성함" className="p-5 bg-white rounded-2xl border border-stone-100 outline-none focus:ring-4 focus:ring-brand-red/5 font-bold text-sm shadow-sm transition-all" />
                 <input name="phone" required placeholder="휴대폰 번호" className="p-5 bg-white rounded-2xl border border-stone-100 outline-none focus:ring-4 focus:ring-brand-red/5 font-bold text-sm shadow-sm transition-all" />
               </div>
               <textarea name="memo" rows={5} placeholder="생년월일 및 태어난 시간, 고민 내용을 상세히 적어주세요." className="w-full p-6 bg-white rounded-2xl border border-stone-100 outline-none focus:ring-4 focus:ring-brand-red/5 font-bold text-sm resize-none shadow-sm transition-all"></textarea>
               <button type="submit" className="w-full py-6 bg-brand-red text-white font-black rounded-2xl text-base shadow-2xl hover:bg-brand-ink transition-all transform active:scale-95">
                 프리미엄 상담 예약하기
               </button>
             </form>
          </div>
        )}

        <footer className="mt-40 border-t border-stone-100 pt-20 pb-16 text-center">
          <div className="mb-10 opacity-30">
            <div className="w-10 h-10 bg-brand-ink rounded-lg flex items-center justify-center mx-auto grayscale">
              <span className="text-white text-xs font-black">明</span>
            </div>
          </div>
          <p className="text-[10px] text-stone-400 font-bold leading-loose max-w-xs mx-auto tracking-tight">
            © 2024 MYEONGGYEONG PROJECT. ALL RIGHTS RESERVED.<br/>
            본 서비스는 정통 성명학 원리를 기반으로 한 AI 분석 리포트입니다. 모든 운명은 스스로의 노력으로 완성됩니다.
          </p>
        </footer>
      </div>

      {/* 모바일 하단 탭 바 */}
      <div className="mobile-nav md:hidden border-t border-stone-100 shadow-[0_-5px_30px_rgba(0,0,0,0.03)] bg-white/95">
        <button onClick={() => setView('main')} className={`flex flex-col items-center gap-1.5 transition-all ${view === 'main' ? 'text-brand-red' : 'text-stone-300'}`}>
          <div className="text-xl">{view === 'main' ? '⛩️' : '🏠'}</div>
          <span className="text-[9px] font-black tracking-tighter uppercase">HOME</span>
        </button>
        <button onClick={() => setView('guide')} className={`flex flex-col items-center gap-1.5 transition-all ${view === 'guide' ? 'text-brand-red' : 'text-stone-300'}`}>
          <div className="text-xl">📜</div>
          <span className="text-[9px] font-black tracking-tighter uppercase">INFO</span>
        </button>
        <button onClick={() => setView('consult')} className={`flex flex-col items-center gap-1.5 transition-all ${view === 'consult' ? 'text-brand-red' : 'text-stone-300'}`}>
          <div className="text-xl">💎</div>
          <span className="text-[9px] font-black tracking-tighter uppercase">CARE</span>
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