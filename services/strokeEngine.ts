
import { HANGUL_STROKES_ENGINE, HEXAGRAM_DB, COMMON_HANJA } from '../constants';
import { FortuneResult } from '../types';

const getMod8 = (n: number) => (n % 8 === 0 ? 8 : n % 8);

// 발음오행 판별 (초성 기준)
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

// 음양 판별
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
  const won = n1 + n2;   // 원격(초년)
  const hyung = s + n1;  // 형격(중년)
  const lee = s + n2;    // 이격(장년)
  const jung = s + n1 + n2; // 정격(총운)

  const results: FortuneResult[] = [];

  // 1. 발음오행 분석
  const e1 = getFiveElements(sChar);
  const e2 = getFiveElements(n1Char);
  const e3 = getFiveElements(n2Char);
  results.push({
    category: '오행',
    title: '발음오행(發音五行)',
    name: `${e1}-${e2}-${e3}`,
    description: `성명의 초성이 ${e1}, ${e2}, ${e3}의 기운을 담고 있습니다. 이는 소리의 울림을 통해 운명의 흐름을 조절하는 중요한 지표입니다. 상생의 흐름일 경우 대인관계가 원만하고 사회적 성공이 빠릅니다.`,
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
      ? "음과 양이 적절히 섞여 우주의 질서와 조화를 이루고 있습니다. 성격이 원만하며 인생의 굴곡이 적고 평탄한 운세입니다." 
      : "음양의 균형이 한쪽으로 치우쳐 있습니다. 기운이 너무 강하거나 약할 수 있으니 생활 환경에서 부족한 기운을 채우는 지혜가 필요합니다.",
    status: isBalanced ? 'good' : 'bad'
  });

  // 3. 81수리 분석 (형격과 정격 중심)
  const hyungHex = HEXAGRAM_DB[`${getMod8(hyung)}${getMod8(won)}`] || { name: '중년운', desc: '평탄한 시기입니다.', status: 'neutral' };
  const jungHex = HEXAGRAM_DB[`${getMod8(jung)}${getMod8(won)}`] || { name: '평생 총운', desc: '하늘의 뜻을 따르십시오.', status: 'neutral' };

  results.push({
    category: '수리',
    title: '81수리: 형격(중년)',
    name: hyungHex.name,
    description: hyungHex.desc,
    status: hyungHex.status as any
  });

  results.push({
    category: '수리',
    title: '81수리: 정격(총운)',
    name: jungHex.name,
    description: jungHex.desc,
    status: jungHex.status as any
  });

  return results;
};
