export interface Word {
  hanzi: string;
  pinyin: string;
  en: string;
  pt: string;
}

export interface HanziCard {
  id: string;
  hanzi: string;
  x?: number;
  y?: number;
  isOnCanvas?: boolean;
  word?: Word;
}

export interface CaptionSettings {
  showPinyin: boolean;
  showEnglish: boolean;
  showPortuguese: boolean;
  soundEnabled: boolean;
}

export interface HanziInfo {
  pinyin: string;
  en: string;
  pt: string;
}

export interface WordInfo {
  pinyin: string;
  en: string;
  pt: string;
}

export interface DictionaryLevel {
  id: number;
  hanzi: string[];
  notes: string;
  availableExamples: string[];
}

export interface DictionaryProgress {
  advanceRule: "5_words_or_all_combos";
  levels: DictionaryLevel[];
}

export interface Dictionary {
  id: string;
  name: string;
  description: string;
  hanzi: Record<string, HanziInfo>;
  targetWords: Record<string, WordInfo>;
  progress?: DictionaryProgress;
  isActive: boolean;
  isDefault?: boolean;
}

export interface GameState {
  level: number;
  currentLevels: Record<string, number>; // Track current level for each dictionary
  knownWords: Word[];
  captions: CaptionSettings;
  canvasCards: HanziCard[];
  dictionaries: Dictionary[];
}

export const DEFAULT_DICTIONARY: Dictionary = {
  id: "hsk1-progress-demo",
  name: "HSK 1 — Progress Demo (Levels 1–4)",
  description:
    "Progress demo using 19 Hanzi. Unlock next level every 5 discovered words or when all valid combos for the current set are found. Words are official/simple HSK1-style items using only these Hanzi.",
  isActive: true,
  isDefault: true,
  hanzi: {
    我: { pinyin: "wǒ", en: "I; me", pt: "eu; mim" },
    你: { pinyin: "nǐ", en: "you (singular)", pt: "você" },
    他: { pinyin: "tā", en: "he; him", pt: "ele" },
    她: { pinyin: "tā", en: "she; her", pt: "ela" },
    人: { pinyin: "rén", en: "person", pt: "pessoa" },
    中: {
      pinyin: "Zhōng",
      en: "middle; (part of 'China')",
      pt: "meio; (parte de 'China')",
    },
    国: {
      pinyin: "guó",
      en: "country; nation",
      pt: "país; nação",
    },
    们: {
      pinyin: "men",
      en: "plural suffix (people)",
      pt: "sufixo de plural (pessoas)",
    },
    爸: {
      pinyin: "bà",
      en: "dad (component)",
      pt: "pai (componente)",
    },
    妈: {
      pinyin: "mā",
      en: "mom (component)",
      pt: "mãe (componente)",
    },
    老: {
      pinyin: "lǎo",
      en: "old; elder (as in 'teacher')",
      pt: "velho; ancião (como em 'professor')",
    },
    师: {
      pinyin: "shī",
      en: "teacher; master (component)",
      pt: "mestre; professor (componente)",
    },
    学: {
      pinyin: "xué",
      en: "to study; learn",
      pt: "estudar; aprender",
    },
    生: {
      pinyin: "shēng",
      en: "birth; life; (student as part)",
      pt: "nascer; vida; (aluno como parte)",
    },
    一: { pinyin: "yī", en: "one", pt: "um" },
    二: { pinyin: "èr", en: "two", pt: "dois" },
    三: { pinyin: "sān", en: "three", pt: "três" },
    十: { pinyin: "shí", en: "ten", pt: "dez" },
    百: { pinyin: "bǎi", en: "hundred", pt: "cem" },
  },
  targetWords: {
    中国: {
      pinyin: "Zhōngguó",
      en: "China (country)",
      pt: "China (país)",
    },
    中国人: {
      pinyin: "Zhōngguó rén",
      en: "Chinese person",
      pt: "pessoa chinesa",
    },
    我们: { pinyin: "wǒmen", en: "we; us", pt: "nós" },
    你们: { pinyin: "nǐmen", en: "you (plural)", pt: "vocês" },
    他们: {
      pinyin: "tāmen",
      en: "they; them (male/mixed)",
      pt: "eles",
    },
    学生: {
      pinyin: "xuéshēng",
      en: "student",
      pt: "estudante",
    },
    老师: {
      pinyin: "lǎoshī",
      en: "teacher",
      pt: "professor(a)",
    },
    爸爸: { pinyin: "bàba", en: "dad; father", pt: "pai" },
    妈妈: { pinyin: "māma", en: "mom; mother", pt: "mãe" },
    十一: { pinyin: "shíyī", en: "eleven", pt: "onze" },
    十二: { pinyin: "shí'èr", en: "twelve", pt: "doze" },
    二十: { pinyin: "èrshí", en: "twenty", pt: "vinte" },
    三十: { pinyin: "sānshí", en: "thirty", pt: "trinta" },
    一百: { pinyin: "yìbǎi", en: "one hundred", pt: "cem" },
    中学: {
      pinyin: "zhōngxué",
      en: "middle school",
      pt: "ensino médio / colégio",
    },
  },
  progress: {
    advanceRule: "5_words_or_all_combos",
    levels: [
      {
        id: 1,
        hanzi: ["我", "你", "他", "她", "人", "们", "中", "国"],
        notes: "Level 1 guarantees 5+ discoverable words.",
        availableExamples: [
          "我们",
          "你们",
          "他们",
          "中国",
          "中国人",
        ],
      },
      {
        id: 2,
        hanzi: ["爸", "妈", "学", "生"],
        notes:
          "Adds family terms and student. All words in this level use only Level1+2 hanzi.",
        availableExamples: ["学生", "爸爸", "妈妈", "中学"],
      },
      {
        id: 3,
        hanzi: ["老", "师"],
        notes: "Enables 老师 using only cumulative hanzi.",
        availableExamples: ["老师"],
      },
      {
        id: 4,
        hanzi: ["一", "二", "三", "十", "百"],
        notes:
          "Adds number words. This set alone contains 5 discoverable words.",
        availableExamples: [
          "十一",
          "十二",
          "二十",
          "三十",
          "一百",
        ],
      },
    ],
  },
};

// Legacy support - creates combined data from active dictionaries
export const GAME_DATA = {
  get level1Hanzi() {
    return Object.keys(DEFAULT_DICTIONARY.hanzi);
  },
  get hanziPinyin() {
    const result: Record<string, string> = {};
    Object.entries(DEFAULT_DICTIONARY.hanzi).forEach(
      ([hanzi, info]) => {
        result[hanzi] = info.pinyin;
      },
    );
    return result;
  },
  get hanziEnglish() {
    const result: Record<string, string> = {};
    Object.entries(DEFAULT_DICTIONARY.hanzi).forEach(
      ([hanzi, info]) => {
        result[hanzi] = info.en;
      },
    );
    return result;
  },
  get hanziPortuguese() {
    const result: Record<string, string> = {};
    Object.entries(DEFAULT_DICTIONARY.hanzi).forEach(
      ([hanzi, info]) => {
        result[hanzi] = info.pt;
      },
    );
    return result;
  },
  get targetWords() {
    return Object.entries(DEFAULT_DICTIONARY.targetWords).map(
      ([hanzi, info]) => ({
        hanzi,
        pinyin: info.pinyin,
        en: info.en,
        pt: info.pt,
      }),
    );
  },
};

export const STORAGE_KEYS = {
  level: "hanziGame:level",
  currentLevels: "hanziGame:currentLevels",
  knownWords: "hanziGame:knownWords",
  captions: "hanziGame:captions",
  dictionaries: "hanziGame:dictionaries",
};