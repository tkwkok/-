
import { HANGUL_STROKES_ENGINE, HEXAGRAM_DB, COMMON_HANJA } from '../constants';
import { FortuneResult, HanjaItem } from '../types';

// 대법원 인명용 한자 9,389자 데이터를 검색하기 위한 초고속 딕셔너리 빌드
const HANJA_DICT: Map<string, number> = new Map();
COMMON_HANJA.forEach(item => {
  HANJA_DICT.set(item.h, item.s);
});

const getMod8 = (n: number) => (n % 8 === 0 ? 8 : n % 8);
const getMod6 = (n: number) => (n % 6 === 0 ? 6 : n % 6);

/**
 * 한자 DB에서 획수를 실시간으로 파싱하여 반환합니다.
 * @param hanja 분석할 한자 1글자
 * @returns 강희자전 원획수 (없을 경우 기본 0)
 */
export const parseHanjaDB = (hanja: string): number => {
  return HANJA_DICT.get(hanja) || 0;
};

// 한글 자모 분리 로직
function hangulDecompose(char: string) {
  const code = char.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return null;
  const cho = Math.floor(code / 588);
  const jung = Math.floor((code % 588) / 28);
  const jong = code % 28;
  return { cho, jung, jong };
}

export const getHangulStroke = (char: string): number => {
  if (!char) return 0;
  const d = hangulDecompose(char);
  if (!d) return 0;
  
  const choList = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
  const jungList = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
  const jongList = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

  const choKey = choList[d.cho] as keyof typeof HANGUL_STROKES_ENGINE.CHO;
  const jungKey = jungList[d.jung] as keyof typeof HANGUL_STROKES_ENGINE.JUNG;
  const jongKey = jongList[d.jong] as keyof typeof HANGUL_STROKES_ENGINE.JONG;

  return (HANGUL_STROKES_ENGINE.CHO[choKey] || 0) + 
         (HANGUL_STROKES_ENGINE.JUNG[jungKey] || 0) + 
         (HANGUL_STROKES_ENGINE.JONG[jongKey] || 0);
};

export const analyzeFortune = (s: number, n1: number, n2: number): FortuneResult[] => {
  // 원, 형, 이, 정 수치 정의 (성명학 정통 공식)
  const won = n1 + n2; // 원(元): 초년운 (이름1 + 이름2)
  const hyung = s + n1; // 형(亨): 중년운 (성 + 이름1)
  const lee = s + n2; // 이(利): 장년운 (성 + 이름2)
  const jung = s + n1 + n2; // 정(貞): 총운 (성명의 총 획수)

  const resultConfigs = [
    { title: "인생 총운", u: getMod8(jung), l: getMod8(won), formula: "정(총)/8, 원(이름)/8" },
    { title: "초년운 (기초)", u: getMod8(hyung), l: getMod8(won), formula: "형(성+명1)/8, 원(이름)/8" },
    { title: "중년운 (성장)", u: getMod8(hyung), l: getMod8(lee), formula: "형(성+명1)/8, 이(성+명2)/8" },
    { title: "말년운 (수성)", u: getMod8(hyung), l: getMod6(jung), formula: "형(성+명1)/8, 정(총)/6" }
  ];

  return resultConfigs.map(cfg => {
    const code = `${cfg.u}${cfg.l}`;
    const hex = HEXAGRAM_DB[code] || { 
      name: `${code}번 괘`, 
      desc: "주역의 이치가 담긴 시기입니다. 하늘의 뜻을 따르며 정진하시기 바랍니다.", 
      status: "neutral" 
    };
    return {
      title: cfg.title,
      upper: cfg.u,
      lower: cfg.l,
      code,
      name: hex.name,
      description: hex.desc,
      status: hex.status as 'good' | 'bad' | 'neutral'
    };
  });
};
