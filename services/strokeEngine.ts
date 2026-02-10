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
  // 81수리 원형이정(元亨利貞) 정통 산출식 (Excel Logic 기반)
  const won = n1 + n2;   // 원격(초년운): 이름 상+하
  const hyung = s + n1;  // 형격(중년운): 성 + 이름 상
  const lee = s + n2;    // 이격(장년운): 성 + 이름 하
  const jung = s + n1 + n2; // 정격(말년/총운): 성 + 이름 상 + 이름 하

  const results: FortuneResult[] = [];

  // 1. 발음오행 분석
  const e1 = getFiveElements(sChar);
  const e2 = getFiveElements(n1Char);
  const e3 = getFiveElements(n2Char);
  results.push({
    category: '오행',
    title: '발음오행(發音五行)',
    name: `${e1}-${e2}-${e3}`,
    description: `성명의 초성이 ${e1}, ${e2}, ${e3}의 기운을 담고 있습니다. 소리의 파동이 상생하면 사회적 성공이 빠르고 상극하면 고난이 따릅니다.`,
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
      ? "음과 양이 조화롭게 섞여 있어 인생이 평탄하고 성품이 원만합니다." 
      : "음양의 균형이 한쪽으로 치우쳐 삶의 굴곡이 생길 수 있습니다.",
    status: isBalanced ? 'good' : 'bad'
  });

  // 3. 81수리 분석 (형격과 정격 중심)
  // 주역 64괘 도출을 위해 상괘(성+명상)와 하괘(성+명상+명하)의 모듈러 8 적용
  const hyungKey = `${getMod8(hyung)}${getMod8(jung)}`;
  const hyungHex = HEXAGRAM_DB[hyungKey] || { name: '중년의 기상', desc: '내실을 기하면 대성합니다.', status: 'neutral' };
  
  const jungKey = `${getMod8(jung)}${getMod8(won)}`;
  const jungHex = HEXAGRAM_DB[jungKey] || { name: '평생 총운', desc: '근본을 지키면 하늘이 돕습니다.', status: 'neutral' };

  results.push({
    category: '수리',
    title: '81수리: 형격(중년운)',
    name: hyungHex.name,
    description: `수리 ${hyung}획: ${hyungHex.desc}`,
    status: hyungHex.status as any
  });

  results.push({
    category: '수리',
    title: '81수리: 정격(총운)',
    name: jungHex.name,
    description: `수리 ${jung}획: ${jungHex.desc}`,
    status: jungHex.status as any
  });

  return results;
};