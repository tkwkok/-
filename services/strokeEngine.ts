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
    description: `성명의 울림이 ${e1}, ${e2}, ${e3}의 파동을 형성하여 외부 세계와 공명합니다. 상생의 흐름은 사회적 지위를 높이고 예기치 못한 귀인을 불러오는 강력한 자석 역할을 합니다. 특히 금전적 흐름의 원활함과 사회적 평판을 좌우하는 핵심 요소입니다.`,
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
      ? "하늘과 땅의 기운이 조화롭게 섞여 인생의 파도가 완만하고 평온합니다. 이는 정서적 안정뿐만 아니라 재물 보존 능력이 뛰어남을 의미하며, 장기적인 성공을 뒷받침하는 탄탄한 심리적 기초가 됩니다." 
      : "기운이 한쪽으로 집중되어 있어 독보적인 카리스마나 특정 분야에서의 천재적 재능을 발휘할 수 있습니다. 환경의 조화를 통해 부족한 기운을 보완하면 오히려 독보적인 도약의 기회가 됩니다.",
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
    description: `수리 ${won}획. 인생의 봄에 해당하는 시기로, 부모의 덕과 학업 성취도를 결정짓는 기초 운세입니다. ${wonHex.desc}`,
    status: wonHex.status as any
  });

  results.push({
    category: '수리',
    title: '형격(亨格): 중년/성공운',
    name: hHex.name,
    description: `수리 ${hyung}획. 사회적 지위와 경제적 기반이 확립되는 인생의 황금기입니다. ${hHex.desc}`,
    status: hHex.status as any
  });

  results.push({
    category: '수리',
    title: '이격(利格): 장년/환경운',
    name: lHex.name,
    description: `수리 ${lee}획. 중년 이후의 안정과 자식 운, 그리고 노후를 향한 다리 역할을 하는 운세입니다. ${lHex.desc}`,
    status: lHex.status as any
  });

  results.push({
    category: '수리',
    title: '정격(貞格): 총운/결실운',
    name: jHex.name,
    description: `수리 ${jung}획. 일생을 관통하는 가장 근본적인 파동이자 말년의 풍요와 명예를 상징하는 절대적 지표입니다. ${jHex.desc}`,
    status: jHex.status as any
  });

  return results;
};
