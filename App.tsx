
import React, { useState } from 'react';
import { AnalysisMode, HanjaItem, FortuneResult } from './types';
import { getHangulStroke, analyzeFortune } from './services/strokeEngine';
import HanjaSelector from './components/HanjaSelector';
import LuckCard from './components/LuckCard';
import AdInterstitial from './components/AdInterstitial';

// 성명학 백과 섹션
const InfoSection = () => (
  <section id="guide" className="mt-20 space-y-12 animate-in fade-in duration-700">
    <div className="text-center">
      <h2 className="text-3xl font-black text-stone-900 mb-2">성명학의 심연</h2>
      <p className="text-stone-500 text-sm italic">"이름은 인생의 항로를 결정하는 보이지 않는 돛입니다"</p>
    </div>
    
    <div className="grid gap-8">
      <div className="oriental-card p-8 rounded-3xl">
        <h3 className="text-xl font-bold text-[#722f37] mb-4">1. 성명학의 정수, 원형이정(元亨利貞)</h3>
        <p className="text-stone-600 leading-loose text-sm">
          정통 성명학의 기초는 사격(四格)의 조화에 있습니다. <br/>
          <strong>원격(元格)</strong>은 만물의 시작이며 유아기부터 청년기까지의 기초 운명을 결정합니다. <br/>
          <strong>형격(亨格)</strong>은 만물의 성장이며 사회적 성공과 가정의 화목을 좌우하는 중년의 핵심입니다. <br/>
          <strong>이격(利格)</strong>은 결실의 시기인 장년기를 관장하며 명예와 내실을 의미합니다. <br/>
          <strong>정격(貞格)</strong>은 인생의 총체적인 귀결로, 죽는 날까지 영향력을 미치는 가장 중요한 대운입니다.
        </p>
      </div>

      <div className="oriental-card p-8 rounded-3xl">
        <h3 className="text-xl font-bold text-[#722f37] mb-4">2. 왜 명경(明鏡)의 주역 분석인가?</h3>
        <p className="text-stone-600 leading-loose text-sm">
          단순한 획수 계산은 성명학의 일부에 불과합니다. <strong>명경</strong>은 우주의 근본 원리인 주역 64괘를 이름의 획수 조합에 대입하여, 단순히 좋고 나쁨을 넘어 현재 당신의 운명이 처한 위치와 위기 극복의 해법을 제시합니다. 거울처럼 맑은 통찰력을 통해 당신의 이름 뒤에 숨겨진 천기를 읽어내십시오.
        </p>
      </div>

      <div className="oriental-card p-8 rounded-3xl">
        <h3 className="text-xl font-bold text-[#722f37] mb-4">3. 소리의 파동과 오행의 상생</h3>
        <p className="text-stone-600 leading-loose text-sm">
          이름은 불려질 때 비로소 생명력을 얻습니다. 한글 자모에 담긴 소리 오행(목, 화, 토, 금, 수)이 서로 부딪히지 않고 상생의 흐름을 타야만 삶의 장애물이 걷히고 순탄한 기운이 찾아옵니다. <strong>명경</strong>은 한글 획수 엔진을 통해 소리의 파동까지 정밀하게 계산하여 완벽한 조화를 분석합니다.
        </p>
      </div>
    </div>
    
    <div className="text-center pt-10">
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-stone-400 text-xs underline">다시 분석하러 가기</button>
    </div>
  </section>
);

const LegalSection = ({ type, onClose }: { type: 'privacy' | 'terms', onClose: () => void }) => (
  <div className="fixed inset-0 z-[110] bg-white overflow-y-auto p-8 animate-in slide-in-from-bottom-5 duration-300">
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-black">{type === 'privacy' ? '개인정보처리방침' : '이용약관'}</h2>
        <button onClick={onClose} className="text-stone-400 font-bold text-3xl">&times;</button>
      </div>
      <div className="text-stone-600 text-sm leading-relaxed space-y-6 whitespace-pre-wrap">
        {type === 'privacy' ? `
본 서비스(이하 '명경')는 이용자의 개인정보를 소중히 다루며, 관련 법령을 준수합니다.

1. 수집 항목: 성명 분석을 위해 입력하는 성명(한글/한자). 상담 신청 시 연락처.
2. 수집 목적: 운세 분석 결과 제공 및 상담 안내 서비스.
3. 보유 기간: 성명 분석 데이터는 세션 종료 후 즉시 파기(서버 저장 안함). 상담 신청 정보는 목적 달성 후 1년 내 파기.
4. 정보 공유: 이용자의 동의 없이 제3자에게 제공하지 않습니다.
5. 광고 게재: 본 사이트는 구글 애드센스를 통해 광고를 송출하며, 이 과정에서 쿠키를 사용할 수 있습니다.
        ` : `
제1조 (목적) 이 약관은 '명경'이 제공하는 성명학 분석 서비스의 이용 조건을 규정합니다.
제2조 (면책) 본 서비스에서 제공하는 분석 결과는 주역 및 성명학 이론에 근거한 참고용 자료이며, 이용자의 삶에 대한 법적/실질적 책임을 지지 않습니다.
제3조 (저작권) 본 사이트의 모든 디자인과 해설 텍스트의 저작권은 '명경'에 있습니다.
        `}
      </div>
      <button onClick={onClose} className="mt-12 w-full py-4 bg-stone-100 rounded-xl font-bold text-stone-500">닫기</button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [mode, setMode] = useState<AnalysisMode>(AnalysisMode.HANGUL);
  const [view, setView] = useState<'main' | 'guide' | 'legal'>('main');
  const [legalType, setLegalType] = useState<'privacy' | 'terms'>('privacy');
  
  const [nameInput, setNameInput] = useState({ s: '', n1: '', n2: '' });
  const [hanjaItems, setHanjaItems] = useState<(HanjaItem | null)[]>([null, null, null]);
  const [curSlot, setCurSlot] = useState<number | null>(null);
  const [results, setResults] = useState<FortuneResult[]>([]);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [analysisCount, setAnalysisCount] = useState(0);

  const runAnalysis = () => {
    let sStrokes = 0, n1Strokes = 0, n2Strokes = 0;
    if (mode === AnalysisMode.HANGUL) {
      if (!nameInput.s || !nameInput.n1 || !nameInput.n2) { alert("성함을 입력하세요."); return; }
      sStrokes = getHangulStroke(nameInput.s);
      n1Strokes = getHangulStroke(nameInput.n1);
      n2Strokes = getHangulStroke(nameInput.n2);
    } else {
      if (hanjaItems.some(x => x === null)) { alert("한자를 선택하세요."); return; }
      sStrokes = hanjaItems[0]!.s; n1Strokes = hanjaItems[1]!.s; n2Strokes = hanjaItems[2]!.s;
    }

    const fortuneResults = analyzeFortune(sStrokes, n1Strokes, n2Strokes);
    setAnalysisCount(prev => prev + 1);
    
    if ((analysisCount + 1) % 5 === 0) {
      setResults(fortuneResults); setShowAd(true);
    } else {
      setResults(fortuneResults); setIsAnalyzed(true);
      setTimeout(() => document.getElementById('analysis-anchor')?.scrollIntoView({ behavior: 'smooth' }), 200);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 글로벌 네비게이션 */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => { setView('main'); window.scrollTo(0, 0); }} className="text-2xl font-black text-[#722f37] tracking-tighter">明鏡</button>
          <div className="flex gap-4 text-[12px] font-bold text-stone-500 uppercase tracking-widest">
            <button onClick={() => { setView('main'); window.scrollTo(0, 0); }} className="nav-link">Home</button>
            <button onClick={() => { setView('guide'); window.scrollTo(0, 0); }} className="nav-link">Guide</button>
          </div>
        </div>
      </nav>

      <div className="max-w-md mx-auto flex-1 w-full pb-20 pt-10 px-6">
        {view === 'main' ? (
          <>
            <header className="text-center mb-12 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#c5a059]/5 rounded-full blur-3xl -z-10"></div>
              <span className="text-[11px] text-[#c5a059] font-black tracking-[0.4em] uppercase">정통 주역 성명 분석</span>
              <h1 className="text-6xl font-black text-stone-900 tracking-tighter mt-2">명경</h1>
              <p className="text-[12px] text-stone-500 mt-4 italic">"이름의 이치를 거울처럼 맑게 비추다"</p>
            </header>

            <div className="flex bg-stone-200/40 p-1 rounded-2xl mb-10 border border-stone-200">
              <button 
                onClick={() => setMode(AnalysisMode.HANGUL)}
                className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${mode === AnalysisMode.HANGUL ? 'bg-white text-[#722f37] shadow-sm' : 'text-stone-400'}`}
              >
                한글 분석
              </button>
              <button 
                onClick={() => setMode(AnalysisMode.HANJA)}
                className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${mode === AnalysisMode.HANJA ? 'bg-white text-[#722f37] shadow-sm' : 'text-stone-400'}`}
              >
                한자 분석
              </button>
            </div>

            <main>
              <div className="oriental-card bg-white p-8 rounded-[2.5rem] mb-10 overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#722f37]"></div>
                {mode === AnalysisMode.HANGUL ? (
                  <div className="grid grid-cols-3 gap-6 mb-8">
                    {(['s', 'n1', 'n2'] as const).map((key, idx) => (
                      <div key={key} className="flex flex-col items-center">
                        <input 
                          type="text" value={nameInput[key]}
                          onChange={(e) => setNameInput(prev => ({ ...prev, [key]: e.target.value.substring(0, 1) }))}
                          placeholder={key === 's' ? "성" : `명${idx}`}
                          className="w-full text-center text-4xl font-black border-b-2 border-stone-100 outline-none focus:border-[#722f37] py-3 bg-transparent transition-all placeholder:text-stone-100"
                        />
                        <span className="text-[10px] mt-2 text-[#c5a059] font-bold uppercase">{getHangulStroke(nameInput[key])} STROKES</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-6 mb-8">
                    {hanjaItems.map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <button 
                          onClick={() => setCurSlot(idx)}
                          className={`w-full aspect-[3/4] flex flex-col items-center justify-center border-2 border-dashed rounded-2xl transition-all ${item ? 'border-[#722f37] bg-red-50/20' : 'border-stone-100'}`}
                        >
                          <span className="text-4xl font-black">{item ? item.h : (idx === 0 ? '姓' : `名${idx}`)}</span>
                          {item && <span className="text-[10px] mt-1 text-stone-400 font-bold">{item.k}</span>}
                        </button>
                        <span className="text-[10px] mt-2 text-[#c5a059] font-bold uppercase">{item?.s || 0} STROKES</span>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={runAnalysis} className="w-full py-5 btn-premium rounded-2xl font-black text-xl shadow-xl hover:brightness-110 active:scale-95 transition-all">
                  운명 분석하기
                </button>
              </div>

              <div id="analysis-anchor"></div>
              {isAnalyzed && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500 mb-12">
                  <div className="text-center">
                    <h3 className="text-stone-400 font-black text-[10px] tracking-widest uppercase mb-6">분석 결과 리포트</h3>
                    <div className="space-y-6">
                      {results.map((res, i) => <LuckCard key={i} fortune={res} />)}
                    </div>
                  </div>
                </div>
              )}

              {/* 가이드 유도 (애드센스용) */}
              <div className="mt-12 p-8 bg-stone-100 rounded-[2.5rem] border border-stone-200">
                <h4 className="font-black text-stone-800 mb-2">성명학에 담긴 깊은 이치를 확인하세요</h4>
                <p className="text-stone-500 text-xs leading-relaxed mb-4">명경(明鏡)이 제안하는 성명 분석 가이드를 통해 본인의 타고난 운명을 더 깊이 이해할 수 있습니다.</p>
                <button onClick={() => { setView('guide'); window.scrollTo(0, 0); }} className="text-[#722f37] font-black text-sm underline decoration-2 underline-offset-4">성명학 상세 가이드 &rarr;</button>
              </div>

              {/* 1:1 전문 작명 신청란 */}
              <section className="mt-12 oriental-card bg-[#1a1a1a] p-8 rounded-[40px] shadow-2xl relative overflow-hidden text-white border-none">
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#c5a059] to-transparent opacity-30"></div>
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-black tracking-tighter mb-2">1:1 프리미엄 작명</h2>
                  <p className="text-[11px] text-stone-400 font-medium leading-relaxed px-4">
                    주역의 지혜와 수리 오행의 조화로 평생의 복이 깃든 최고의 이름을 짓습니다. <br/>
                    <span className="text-[#c5a059] font-bold">발음오행, 발음음양, 81수리, 자원오행 및 용신분석</span>을 통해 명경(明鏡)의 원장이 직접 엄선한 작명 서비스를 경험하세요.
                  </p>
                </div>

                <form action="https://formspree.io/f/xpqjwjjw" method="POST" className="space-y-4">
                  <input type="hidden" name="_subject" value="명경 1:1 작명 상담 신청" />
                  <div>
                    <input 
                      type="text" name="name" required 
                      className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 focus:border-[#c5a059] focus:bg-white/10 outline-none transition-all text-sm"
                      placeholder="신청자 성함"
                    />
                  </div>
                  <div>
                    <input 
                      type="tel" name="contact" required 
                      className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 focus:border-[#c5a059] focus:bg-white/10 outline-none transition-all text-sm"
                      placeholder="연락처 (안내 문자 발송용)"
                    />
                  </div>
                  <div>
                    <textarea 
                      name="message" rows={3}
                      className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 focus:border-[#c5a059] focus:bg-white/10 outline-none transition-all resize-none text-sm"
                      placeholder="상담 내용 (태어난 일시, 희망하는 분위기 등)"
                    ></textarea>
                  </div>
                  <button type="submit" className="w-full py-5 bg-[#c5a059] text-stone-950 rounded-2xl font-black text-xl shadow-lg hover:brightness-110 active:scale-95 transition-all">
                    전문 작명 상담 신청하기
                  </button>
                </form>
                <p className="mt-4 text-[9px] text-stone-500 text-center uppercase tracking-widest">Premium Naming Service by MyeongGyeong</p>
              </section>
            </main>
          </>
        ) : (
          <InfoSection />
        )}
      </div>

      <footer className="bg-stone-950 text-white p-12 mt-20">
        <div className="max-w-md mx-auto space-y-8 text-center">
          <div>
            <h2 className="text-3xl font-black tracking-[0.2em] text-[#c5a059] mb-1">明鏡</h2>
            <p className="text-stone-600 text-[10px] font-bold uppercase tracking-widest">The Mirror of Destiny</p>
          </div>
          
          <div className="flex justify-center gap-8 text-[11px] font-bold text-stone-400">
            <button onClick={() => { setLegalType('privacy'); setView('legal'); window.scrollTo(0, 0); }}>개인정보처리방침</button>
            <button onClick={() => { setLegalType('terms'); setView('legal'); window.scrollTo(0, 0); }}>이용약관</button>
          </div>

          <div className="pt-8 border-t border-white/5">
            <p className="text-stone-700 text-[9px] leading-relaxed">
              본 서비스 '명경(明鏡)'은 정통 성명학 및 주역 이론에 기반한 이름 풀이를 제공합니다.<br/>
              Copyright &copy; 2026 MyeongGyeong. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {curSlot !== null && <HanjaSelector title={curSlot === 0 ? "성씨" : `이름${curSlot}`} onSelect={(i) => { const n = [...hanjaItems]; n[curSlot] = i; setHanjaItems(n); setCurSlot(null); }} onClose={() => setCurSlot(null)} />}
      {showAd && <AdInterstitial onClose={() => { setShowAd(false); setIsAnalyzed(true); setTimeout(() => document.getElementById('analysis-anchor')?.scrollIntoView({ behavior: 'smooth' }), 200); }} />}
      {view === 'legal' && <LegalSection type={legalType} onClose={() => setView('main')} />}
    </div>
  );
};

export default App;
