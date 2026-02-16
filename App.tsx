
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FortuneResult } from './types';
import { getHangulStroke, analyzeFortune } from './services/strokeEngine';
import LuckCard from './components/LuckCard';
import AdInterstitial from './components/AdInterstitial';

type ViewType = 'main' | 'history' | 'principles' | 'consult' | 'privacy' | 'terms';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('main');
  const [nameInput, setNameInput] = useState({ s: '', n1: '', n2: '' });
  const [results, setResults] = useState<FortuneResult[]>([]);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  const handleHangulInput = useCallback((key: 's' | 'n1' | 'n2', val: string) => {
    const latestChar = val.trim().length > 0 ? val.trim().slice(-1) : "";
    setNameInput(prev => ({ ...prev, [key]: latestChar }));
  }, []);

  const strokeData = useMemo(() => {
    const s = getHangulStroke(nameInput.s);
    const n1 = getHangulStroke(nameInput.n1);
    const n2 = getHangulStroke(nameInput.n2);
    return {
      s, n1, n2,
      won: n1 + n2,
      hyung: s + n1,
      lee: s + n2,
      jung: s + n1 + n2
    };
  }, [nameInput]);

  const runAnalysis = async () => {
    const { s, n1, n2 } = nameInput;
    if (!s || !n1 || !n2) { alert("성함 3글자를 모두 입력해 주세요."); return; }
    
    setIsLoading(true);
    setIsAnalyzed(false);
    
    setTimeout(() => {
      const baseResults = analyzeFortune(strokeData.s, strokeData.n1, strokeData.n2, s, n1, n2);
      setResults(baseResults);
      setIsLoading(false);
      setIsAnalyzed(true);
      setTimeout(() => document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' }), 300);
    }, 1200);
  };

  const Nav = () => (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl h-16 flex items-center justify-between px-6 border-b border-stone-100 shadow-sm">
      <button onClick={() => setView('main')} className="flex items-center gap-2">
        <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-black">明</span>
        </div>
        <span className="text-brand-ink text-lg font-black tracking-tighter">명경</span>
      </button>
      <div className="hidden md:flex gap-8 items-center text-[11px] font-black tracking-widest uppercase">
        <button onClick={() => setView('history')} className={view === 'history' ? 'text-brand-red' : 'text-stone-400'}>History</button>
        <button onClick={() => setView('principles')} className={view === 'principles' ? 'text-brand-red' : 'text-stone-400'}>Principles</button>
        <button onClick={() => setView('consult')} className="px-4 py-2 bg-brand-red text-white rounded-full">VIP 상담</button>
      </div>
    </nav>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <div className="max-w-screen-xl mx-auto w-full px-6 py-10 flex-1">
        
        {view === 'main' && (
          <div className="space-y-20">
            {/* Philosophy Section */}
            <section className="bg-white rounded-[3rem] p-12 shadow-sm border border-stone-100 space-y-8">
              <div className="max-w-3xl mx-auto text-center space-y-6">
                <span className="text-brand-gold font-black text-xs tracking-widest uppercase">Scientific Nameology</span>
                <h2 className="text-4xl font-black text-brand-ink tracking-tight leading-tight">현직 약사가 설계한 <span className="text-brand-red">정통 주역 성명학</span> 시스템</h2>
                <div className="w-12 h-1 bg-brand-gold mx-auto"></div>
                <p className="text-stone-600 text-lg leading-relaxed font-medium">
                  "모든 존재는 수(數)의 조화 속에서 에너지를 발산합니다." <br/>
                  현직 약사로서 정밀한 데이터 분석의 중요성을 누구보다 잘 알기에, 명경(明鏡)은 미신을 넘어 주역의 64괘 수리 원리를 철저히 고증하여 알고리즘화했습니다. 성명의 획수를 통해 인생의 4격(원형이정)을 도출하고, 당신의 운명을 거울처럼 맑게 비추어 드립니다.
                </p>
              </div>
            </section>

            {/* Input & Tool Section */}
            <section className="max-w-md mx-auto relative">
              <header className="text-center mb-10">
                <h1 className="text-5xl font-black text-brand-ink tracking-tighter mb-4">성명 분석<span className="text-brand-red">.</span></h1>
                <p className="text-stone-400 text-sm italic">주역 64괘의 이치로 성명을 해독합니다</p>
              </header>
              <div className="premium-oriental-card p-10 bg-white shadow-2xl border-2 border-brand-gold/10">
                <div className="grid grid-cols-3 gap-4 mb-10">
                  {(['s', 'n1', 'n2'] as const).map((key, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2">
                       <input 
                        type="text" 
                        maxLength={1} 
                        value={nameInput[key]} 
                        onChange={(e) => handleHangulInput(key, e.target.value)} 
                        className="input-premium border-b-2 border-stone-100 focus:border-brand-red transition-all" 
                        placeholder={idx === 0 ? "성" : "명"} 
                      />
                      <span className="text-[10px] font-black text-brand-gold">
                        {nameInput[key] ? `${getHangulStroke(nameInput[key])}획` : '-'}
                      </span>
                    </div>
                  ))}
                </div>
                <button onClick={runAnalysis} className="btn-destiny active:scale-95">
                  {isLoading ? '운명 분석 중...' : '분석 결과 보기'}
                </button>
              </div>

              <div id="result-section" className="mt-20">
                {isAnalyzed && (
                  <div className="space-y-12">
                    {/* Stroke Breakdown Dashboard */}
                    <div className="bg-brand-ink p-8 rounded-[2.5rem] text-white shadow-xl">
                      <h4 className="text-xs font-black tracking-widest text-brand-gold uppercase mb-6 text-center">Stroke Analysis Summary</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        <div><p className="text-[10px] opacity-50 mb-1">원격(초년)</p><p className="text-2xl font-black">{strokeData.won}획</p></div>
                        <div><p className="text-[10px] opacity-50 mb-1">형격(중년)</p><p className="text-2xl font-black">{strokeData.hyung}획</p></div>
                        <div><p className="text-[10px] opacity-50 mb-1">이격(장년)</p><p className="text-2xl font-black">{strokeData.lee}획</p></div>
                        <div><p className="text-[10px] opacity-50 mb-1">정격(총운)</p><p className="text-2xl font-black">{strokeData.jung}획</p></div>
                      </div>
                    </div>

                    <div className="ad-placeholder">분석 콘텐츠 중간 광고</div>
                    
                    <div className="grid gap-10">
                      {results.map((res, i) => <LuckCard key={i} fortune={res} />)}
                    </div>

                    {/* Educational Content for AdSense */}
                    <div className="mt-20 pt-20 border-t border-stone-100 space-y-12">
                      <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                          <h4 className="text-xl font-black text-brand-ink tracking-tight">원형이정(元亨利貞)의 과학적 분석</h4>
                          <p className="text-stone-500 text-sm leading-relaxed text-justify">
                            주역 성명학의 핵심인 '원형이정'은 인생의 네 단계를 상징합니다. <b>원격(元格)</b>은 초년운을 결정하는 기초이며, <b>형격(亨格)</b>은 중년의 성공과 직업운을 좌우하는 중심축입니다. <b>이격(利格)</b>은 장년의 결실과 안정을, <b>정격(貞格)</b>은 인생 전체를 관통하는 총운과 말년의 품격을 나타냅니다. 명경은 이 네 가지 격의 획수를 주역 64괘로 치환하여 정밀 분석합니다.
                          </p>
                        </div>
                        <div className="space-y-4">
                          <h4 className="text-xl font-black text-brand-ink tracking-tight">주역 64괘와 소리 파동</h4>
                          <p className="text-stone-500 text-sm leading-relaxed text-justify">
                            이름은 불릴 때마다 고유한 소리 파동(Energy Frequency)을 만들어냅니다. 고대 주역 이론에 따르면 이 파동은 숫자로 치환될 수 있으며, 그 결과 도출되는 64가지의 괘상은 우리 삶이 나아가야 할 방향성을 제시합니다. 명경의 분석은 미신적인 접근이 아닌, 수천 년간 축적된 동양의 통계학적 지혜를 현대적인 알고리즘으로 재해석한 결과물입니다.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <div className="ad-placeholder">하단 반응형 광고</div>
          </div>
        )}

        {/* Support Views (Content for AdSense) */}
        {view === 'history' && (
          <div className="max-w-3xl mx-auto py-10 space-y-12 fade-in-up">
            <h2 className="text-5xl font-black text-brand-ink tracking-tighter">성명학의 역사와 동양 철학</h2>
            <div className="content-block text-stone-700 text-lg space-y-8 leading-loose text-justify">
              <p>성명학은 아주 오랜 역사를 가지고 있습니다. 고대 중국의 복희씨가 팔괘를 창안한 이래, 주나라 문왕에 의해 64괘로 체계화되었으며, 이는 인간의 운명을 연구하는 학문의 기초가 되었습니다. 한국에서는 삼국시대를 거쳐 조선 시대에 이르기까지 성리학적 배경 아래 태어난 아이에게 최고의 이름을 지어주기 위한 국가적, 가문적 노력이 계속되었습니다.</p>
              <p>과거의 작명은 단순히 항렬자를 따르는 문중 중심의 문화였으나, 현대에 이르러서는 개인의 사주(四柱)와 주역 수리의 조화를 최우선으로 하는 맞춤형 작명으로 발전하였습니다. 명경은 이러한 수천 년의 지혜를 현대의 데이터 분석 기법과 결합하여 신뢰도 높은 가이드를 제시합니다.</p>
            </div>
            <button onClick={() => setView('main')} className="text-brand-red font-black border-b-2 border-brand-red">메인으로 돌아가기</button>
          </div>
        )}

        {view === 'principles' && (
          <div className="max-w-3xl mx-auto py-10 space-y-12 fade-in-up">
            <h2 className="text-5xl font-black text-brand-ink tracking-tighter">좋은 이름의 5가지 원칙</h2>
            <div className="content-block text-stone-700 text-lg space-y-10">
              <p className="font-bold border-l-4 border-brand-red pl-6">명경이 추구하는 완벽한 성명 조합은 다음의 원칙을 따릅니다.</p>
              <ul className="space-y-8">
                <li><strong>1. 수리의 영동력 (81수리):</strong> 이름의 획수 합이 길수(吉數)로 배치되어야 하며, 이는 삶의 에너지 기초가 됩니다.</li>
                <li><strong>2. 주역의 괘상 (64괘):</strong> 인생의 각 시점(원형이정)에 해당하는 괘가 긍정적인 메시지를 담고 있어야 합니다.</li>
                <li><strong>3. 음양의 조화:</strong> 한글/한자 획수의 홀수와 짝수가 균형 있게 배치되어야 치우침 없는 인격이 형성됩니다.</li>
                <li><strong>4. 발음오행의 상생:</strong> 소리가 서로를 돕는 상생의 흐름을 가져야 대인관계가 원만해집니다.</li>
                <li><strong>5. 사주와의 보완:</strong> 부족한 오행 기운을 성명을 통해 채워주어 삶의 총체적 조화를 꾀합니다.</li>
              </ul>
            </div>
            <button onClick={() => setView('main')} className="text-brand-red font-black border-b-2 border-brand-red">메인으로 돌아가기</button>
          </div>
        )}

        {view === 'consult' && (
          <div className="max-w-md mx-auto py-10 space-y-10 fade-in-up text-center">
            <h2 className="text-4xl font-black text-brand-ink tracking-tighter">VIP 프리미엄 상담</h2>
            <p className="text-stone-500 font-medium">한자 괘상 분석, 자원오행, 용신 분석을 포함한 전문 상담</p>
            <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-xl space-y-6">
              <input placeholder="성함" className="w-full p-4 bg-stone-50 rounded-2xl border-none outline-none focus:ring-2 ring-brand-red/10" />
              <input placeholder="연락처" className="w-full p-4 bg-stone-50 rounded-2xl border-none outline-none focus:ring-2 ring-brand-red/10" />
              <textarea placeholder="상담 희망 내용" className="w-full p-4 bg-stone-50 rounded-2xl border-none outline-none h-40 resize-none"></textarea>
              <button className="w-full py-5 bg-brand-red text-white font-black rounded-2xl shadow-xl">상담 신청 (유료)</button>
            </div>
          </div>
        )}
      </div>

      <footer className="bg-white border-t border-stone-100 py-16">
        <div className="max-w-screen-xl mx-auto px-6 grid md:grid-cols-3 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-brand-red rounded flex items-center justify-center text-white text-[10px] font-black">明</div>
              <span className="font-black text-lg">명경(明鏡) 성명연구소</span>
            </div>
            <p className="text-stone-400 text-xs leading-relaxed font-medium">현직 약사가 운영하는 정통 주역 성명학 연구소. 인생의 길을 밝히는 올바른 이름의 힘을 믿습니다.</p>
          </div>
          <div className="flex flex-col gap-2 text-xs font-black text-stone-400">
            <button onClick={() => setView('history')} className="hover:text-brand-red text-left">성명학의 역사</button>
            <button onClick={() => setView('principles')} className="hover:text-brand-red text-left">작명의 원칙</button>
            <button onClick={() => setView('consult')} className="hover:text-brand-red text-left">VIP 상담 신청</button>
          </div>
          <div className="flex flex-col gap-2 text-xs font-black text-stone-400 uppercase">
            <button onClick={() => setView('privacy')} className="hover:text-brand-red text-left">Privacy Policy</button>
            <button onClick={() => setView('terms')} className="hover:text-brand-red text-left">Terms of Service</button>
            <p className="mt-4 opacity-40">© 2025 Myeonggyeong Project</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
