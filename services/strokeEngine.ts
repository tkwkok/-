import { HANGUL_STROKES_ENGINE, HEXAGRAM_DB } from '../constants';
import { FortuneResult } from '../types';

const getMod8 = (n: number) => (n % 8 === 0 ? 8 : n % 8);

/**
 * 발음오행 판별 (훈민정음 해례본 기준 정통 성명학 분류)
 */
const getFiveElements = (char: string) => {
  const code = char.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return '미상';
  const choIdx = Math.floor(code / 588);
  const choList = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
  const cho = choList[choIdx];

  if ('ㄱㄲ'.includes(cho)) return '목(木)';
  if ('ㄴㄷㄹㅌㄸ'.includes(cho)) return '화(火)';
  if ('ㅇㅎ'.includes(cho)) return '토(土)';
  if ('ㅅㅈㅊㅆㅉ'.includes(cho)) return '금(金)';
  if ('ㅁㅂㅍㅃ'.includes(cho)) return '수(水)';
  return '미상';
};

const getYinYang = (stroke: number) => (stroke % 2 === 0 ? '음(陰)' : '양(陽)');

export const getHangulStroke = (char: string): number => {
  if (!char) return 0;
  const code = char.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return 0;
  
  const cho = Math.floor(code / 588);
  const jung = Math.floor((code % 588) / 28);
  const jong = code % 28;
  
  const choList = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
  const jungList = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
  const jongList = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

  const choKey = choList[cho] as keyof typeof HANGUL_STROKES_ENGINE.CHO;
  const jungKey = jungList[jung] as keyof typeof HANGUL_STROKES_ENGINE.JUNG;
  const jongKey = jongList[jong] as keyof typeof HANGUL_STROKES_ENGINE.JONG;

  return (HANGUL_STROKES_ENGINE.CHO[choKey] || 0) + 
         (HANGUL_STROKES_ENGINE.JUNG[jungKey] || 0) + 
         (HANGUL_STROKES_ENGINE.JONG[jongKey] || 0);
};

export const analyzeFortune = (s: number, n1: number, n2: number, sChar: string, n1Char: string, n2Char: string): FortuneResult[] => {
  // 81수리 원형이정(元亨利貞) 정통 산출식
  const won = n1 + n2;   // 원격(초년운): 이름 상+하
  const hyung = s + n1;  // 형격(중년운): 성 + 이름 상
  const lee = s + n2;    // 이격(장년운): 성 + 이름 하
  const jung = s + n1 + n2; // 정격(총운): 성 + 이름 상 + 이름 하

  const results: FortuneResult[] = [];

  // 1. 발음오행 분석
  const e1 = getFiveElements(sChar);
  const e2 = getFiveElements(n1Char);
  const e3 = getFiveElements(n2Char);
  results.push({
    category: '오행',
    title: '발음오행(發音五行)',
    name: `${e1}-${e2}-${e3}`,
    description: `성명의 울림이 ${e1}, ${e2}, ${e3}의 기운으로 이어지며 사회적 발산력을 형성합니다. 오행의 상생은 단순한 호감을 넘어 사회적 지위를 공고히 하고, 재물이 모이는 통로를 넓히는 기운을 가지고 있습니다. 소리의 파동이 조화로울수록 인덕이 따르고 금전적 기회가 스스로 찾아오는 형국입니다.`,
    status: 'neutral',
    tags: [e1, e2, e3]
  });

  // 2. 발음음양 분석
  const y1 = getYinYang(s);
  const y2 = getYinYang(n1);
  const y3 = getYinYang(n2);
  const isBalanced = (y1 !== y2) || (y2 !== y3);
  results.push({
    category: '음양',
    title: '음양조화(陰陽調和)',
    name: `${y1}-${y2}-${y3}`,
    description: isBalanced 
      ? "음양의 완벽한 배치는 인생의 험난한 파고를 유연하게 넘기는 지혜를 상징합니다. 이는 심리적 안정감을 줄 뿐만 아니라, 결정적인 순간에 재물과 명예를 지켜내는 견고한 방패 역할을 하여 지속 가능한 번영을 이끌어냅니다." 
      : "기운이 한 방향으로 응집되어 있어 추진력과 카리스마가 매우 강합니다. 이러한 강한 기운은 특정 분야에서 독보적인 성취를 이루는 원동력이 되며, 부족한 기운을 외부 환경(색상, 방위 등)으로 보충할 때 더욱 빛을 발합니다.",
    status: isBalanced ? 'good' : 'bad'
  });

  // 3. 81수리 분석 (원형이정 4격 기반)
  const hexMapping = (val1: number, val2: number) => {
    const key = `${getMod8(val1)}${getMod8(val2)}`;
    return HEXAGRAM_DB[key] || { name: '운세의 흐름', desc: '꾸준한 노력이 결실을 맺는 시기입니다.', status: 'neutral' };
  };

  const wonHex = hexMapping(won, jung);
  const hHex = hexMapping(hyung, won);
  const lHex = hexMapping(lee, won);
  const jHex = hexMapping(jung, won);

  results.push({
    category: '수리',
    title: '원격(元格): 초년/기초운',
    name: wonHex.name,
    description: `수리 ${won}획. 부모의 덕과 학업의 기틀을 다지는 운세입니다. 기초가 튼튼하여 이후의 성장을 뒷받침합니다. ${wonHex.desc}`,
    status: wonHex.status as any
  });

  results.push({
    category: '수리',
    title: '형격(亨格): 중년/성공운',
    name: hHex.name,
    description: `수리 ${hyung}획. 사회적으로 가장 왕성하게 활동하며 부와 명예를 쌓아가는 황금기입니다. ${hHex.desc}`,
    status: hHex.status as any
  });

  results.push({
    category: '수리',
    title: '이격(利格): 장년/환경운',
    name: lHex.name,
    description: `수리 ${lee}획. 가정의 화목과 사회적 성취가 안정 궤도에 오르는 결실의 시기입니다. ${lHex.desc}`,
    status: lHex.status as any
  });

  results.push({
    category: '수리',
    title: '정격(貞格): 총운/결실운',
    name: jHex.name,
    description: `수리 ${jung}획. 일생을 관통하는 가장 강력한 파동이자 말년의 평안과 가문의 번창을 결정짓는 핵심 지표입니다. ${jHex.desc}`,
    status: jHex.status as any
  });

  return results;
};
