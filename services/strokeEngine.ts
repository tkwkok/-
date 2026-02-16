
import { HANGUL_STROKES_ENGINE, HEXAGRAM_DB } from '../constants';
import { FortuneResult } from '../types';

const getMod = (n: number, div: number) => (n % div === 0 ? div : n % div);

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
  // 4격 기초 획수 계산 (사용자 요청 공식)
  const won = n1 + n2;          // 원격 (이름1 + 이름2)
  const hyung = s + n1;         // 형격 (성 + 이름1)
  const lee = s + n2;           // 이격 (성 + 이름2)
  const jung = s + n1 + n2;     // 정격 (성 + 이름1 + 이름2)

  const getHex = (upper: number, lower: number) => {
    const key = `${upper}${lower}`;
    return HEXAGRAM_DB[key] || { 
      name: `운명의 괘 (${upper}-${lower})`, 
      desc: '꾸준한 노력이 결실을 맺는 시기입니다. 겸손함으로 덕을 쌓으십시오. 현재 이 괘의 상세 데이터가 준비 중입니다.', 
      status: 'neutral' 
    };
  };

  /**
   * 사용자 지정 공식:
   * 총운(정): 상괘=정/8, 하괘=원/8
   * 초년운(원): 상괘=형/8, 하괘=원/8
   * 중년운(형): 상괘=형/8, 하괘=이/8
   * 말년운(이): 상괘=형/8, 하괘=정/6
   */
  const wonResult = getHex(getMod(hyung, 8), getMod(won, 8));
  const hyungResult = getHex(getMod(hyung, 8), getMod(lee, 8));
  const leeResult = getHex(getMod(hyung, 8), getMod(jung, 6)); 
  const jungResult = getHex(getMod(jung, 8), getMod(won, 8));

  return [
    {
      category: '종합',
      title: '초년운 (元格)',
      name: wonResult.name,
      description: wonResult.desc,
      status: wonResult.status as any,
      tags: [`수치: ${getMod(hyung, 8)}-${getMod(won, 8)}`]
    },
    {
      category: '종합',
      title: '중년운 (亨格)',
      name: hyungResult.name,
      description: hyungResult.desc,
      status: hyungResult.status as any,
      tags: [`수치: ${getMod(hyung, 8)}-${getMod(lee, 8)}`]
    },
    {
      category: '종합',
      title: '장년운 (利格)',
      name: leeResult.name,
      description: leeResult.desc,
      status: leeResult.status as any,
      tags: [`수치: ${getMod(hyung, 8)}-${getMod(jung, 6)}`]
    },
    {
      category: '종합',
      title: '총운 (貞格)',
      name: jungResult.name,
      description: jungResult.desc,
      status: jungResult.status as any,
      tags: [`수치: ${getMod(jung, 8)}-${getMod(won, 8)}`]
    }
  ];
};
