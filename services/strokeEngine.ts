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
  const won = n1 + n2;   
  const hyung = s + n1;  
  const lee = s + n2;    
  const jung = s + n1 + n2; 

  const results: FortuneResult[] = [];

  const e1 = getFiveElements(sChar);
  const e2 = getFiveElements(n1Char);
  const e3 = getFiveElements(n2Char);
  results.push({
    category: '오행',
    title: '발음오행(發音五行)',
    name: `${e1}-${e2}-${e3}`,
    description: `성명의 소리가 ${e1}, ${e2}, ${e3}의 파동으로 굽이치며 귀하의 사회적 '성공 주파수'를 결정합니다. 상생의 기운은 외부의 장벽을 허물고 인적 네트워크를 부의 통로로 전환하는 강력한 자석과 같습니다. 소리의 조화가 깊을수록 명예와 실리가 스스로 문을 두드리는 형국입니다.`,
    status: 'neutral',
    tags: [e1, e2, e3]
  });

  const y1 = getYinYang(s);
  const y2 = getYinYang(n1);
  const y3 = getYinYang(n2);
  const isBalanced = (y1 !== y2) || (y2 !== y3);
  results.push({
    category: '음양',
    title: '음양조화(陰陽調和)',
    name: `${y1}-${y2}-${y3}`,
    description: isBalanced 
      ? "음과 양의 절묘한 배치는 생명력의 원천이며, 어떠한 풍파에도 무너지지 않는 '운명의 골조'가 되어줍니다. 이는 단순한 행운을 넘어 위기 상황에서 재산과 건강을 지켜내는 수호적 기운으로 작용하며, 삶의 굴곡을 완만하게 다스리는 지혜의 상징입니다." 
      : "기운이 한곳으로 응집된 '일방독주'의 형상이나, 이는 오히려 한 분야의 정점에 오를 수 있는 비범한 집중력을 뜻합니다. 이러한 강력한 에너지는 시대의 흐름을 주도하는 리더의 자질이며, 환경의 보완을 통해 이를 다듬는다면 독보적인 거목으로 성장할 수 있습니다.",
    status: isBalanced ? 'good' : 'bad'
  });

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
    title: '원격(元格): 초년/기반운',
    name: wonHex.name,
    description: `수리 ${won}획. 인생의 뿌리를 내리는 시기로 부모의 음덕과 기초 학업의 완성을 주관합니다. 옥토에 씨를 뿌리는 마음으로 기반을 닦는 시기입니다. ${wonHex.desc}`,
    status: wonHex.status as any
  });

  results.push({
    category: '수리',
    title: '형격(亨格): 중년/성공운',
    name: hHex.name,
    description: `수리 ${hyung}획. 사회적 자아를 확립하고 경제적 가치를 창출하는 인생의 정점입니다. 귀하의 역량이 세상에 투영되어 큰 성취를 이끄는 핵심 파동입니다. ${hHex.desc}`,
    status: hHex.status as any
  });

  results.push({
    category: '수리',
    title: '이격(利格): 장년/환경운',
    name: lHex.name,
    description: `수리 ${lee}획. 중년의 성취를 안정적으로 보존하고 가문을 번창시키는 시기입니다. 외부의 거친 기운이 정화되어 평온과 안정을 얻는 수확의 때입니다. ${lHex.desc}`,
    status: lHex.status as any
  });

  results.push({
    category: '수리',
    title: '정격(貞格): 총운/결실운',
    name: jHex.name,
    description: `수리 ${jung}획. 삶의 전체를 관통하는 근본적인 에너지이자 말년의 영광과 후손의 번창을 상징합니다. 최종적인 '운명의 등급'을 결정짓는 절대적인 지표입니다. ${jHex.desc}`,
    status: jHex.status as any
  });

  return results;
};