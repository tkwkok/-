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
    description: `소리의 파동이 ${e1}, ${e2}, ${e3}의 흐름을 형성합니다. 상생의 조화는 주변의 도움을 이끌어내며, 특히 대인관계와 사회적 명망에서 강력한 이점을 발휘합니다.`,
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
      ? "음과 양이 완벽한 균형을 이루어 삶의 기초가 탄탄합니다. 어떠한 시련에도 유연하게 대처할 수 있는 내면의 힘을 상징합니다." 
      : "기운이 한쪽으로 집중되어 있어 강력한 개성을 지닙니다. 환경의 조화를 통해 부족한 기운을 보완하면 독보적인 성취가 가능합니다.",
    status: isBalanced ? 'good' : 'bad'
  });

  // 3. 81수리 분석 (원형이정 4격 기반 Juyeok mapping)
  const hKey = `${getMod8(hyung)}${getMod8(won)}`;
  const hHex = HEXAGRAM_DB[hKey] || { name: '형격(중년)', desc: '지혜로운 처세가 요구되는 시기입니다.', status: 'neutral' };
  
  const jKey = `${getMod8(jung)}${getMod8(won)}`;
  const jHex = HEXAGRAM_DB[jKey] || { name: '정격(총운)', desc: '근본을 지키면 대업을 이룹니다.', status: 'neutral' };

  results.push({
    category: '수리',
    title: '형격(중년운): 사회적 성공',
    name: hHex.name,
    description: `수리 ${hyung}획의 기운이 인생의 황금기인 중년운을 주도합니다. ${hHex.desc}`,
    status: hHex.status as any
  });

  results.push({
    category: '수리',
    title: '정격(총운): 인생의 결실',
    name: jHex.name,
    description: `수리 ${jung}획은 삶의 전체를 관통하는 핵심 파동입니다. ${jHex.desc} 최종적인 부와 귀를 결정짓는 근간이 됩니다.`,
    status: jHex.status as any
  });

  return results;
};