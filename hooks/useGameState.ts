import { useState, useEffect } from 'react';
import { GameState, Word, HanziCard, CaptionSettings, Dictionary, DEFAULT_DICTIONARY, STORAGE_KEYS } from '../types/game';

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    currentLevels: {},
    knownWords: [],
    captions: {
      showPinyin: true,
      showEnglish: true,
      showPortuguese: false,
      soundEnabled: true
    },
    canvasCards: [
      { id: 'initial-1', hanzi: '我', x: 100, y: 150, isOnCanvas: true },
      { id: 'initial-2', hanzi: '们', x: 250, y: 150, isOnCanvas: true }
    ],
    dictionaries: [DEFAULT_DICTIONARY]
  });

  // Migration function to convert old dictionary format to new format
  const migrateDictionary = (oldDict: any): Dictionary => {
    // If it's already in the new format with progress, return as is
    if (oldDict.hanzi && typeof oldDict.hanzi === 'object' && !Array.isArray(oldDict.hanzi) && oldDict.progress) {
      return oldDict;
    }

    // If it's the old default dictionary, replace with new one
    if (oldDict.id === 'default' && oldDict.isDefault) {
      return {
        ...DEFAULT_DICTIONARY,
        isActive: oldDict.isActive
      };
    }

    // If it's new format but no progress (user-imported dictionary), add simple progress
    if (oldDict.hanzi && typeof oldDict.hanzi === 'object' && !Array.isArray(oldDict.hanzi) && !oldDict.progress) {
      return {
        ...oldDict,
        progress: {
          advanceRule: "5_words_or_all_combos" as const,
          levels: [
            {
              id: 1,
              hanzi: Object.keys(oldDict.hanzi),
              notes: "All hanzi available",
              availableExamples: Object.keys(oldDict.targetWords || {})
            }
          ]
        }
      };
    }

    // Convert old format to new format (legacy support)
    const newDict: Dictionary = {
      id: oldDict.id,
      name: oldDict.name,
      description: oldDict.description,
      isActive: oldDict.isActive,
      isDefault: oldDict.isDefault,
      hanzi: {},
      targetWords: {},
      progress: {
        advanceRule: "5_words_or_all_combos",
        levels: [
          {
            id: 1,
            hanzi: [],
            notes: "Migrated from old format",
            availableExamples: []
          }
        ]
      }
    };

    // Convert level1Hanzi array and separate translation objects to combined hanzi object
    if (oldDict.level1Hanzi) {
      newDict.progress!.levels[0].hanzi = [...oldDict.level1Hanzi];
      
      oldDict.level1Hanzi.forEach((hanzi: string) => {
        newDict.hanzi[hanzi] = {
          pinyin: oldDict.hanziPinyin?.[hanzi] || hanzi,
          en: oldDict.hanziEnglish?.[hanzi] || hanzi,
          pt: oldDict.hanziPortuguese?.[hanzi] || hanzi
        };
      });
    }

    // Convert targetWords array to object
    if (oldDict.targetWords && Array.isArray(oldDict.targetWords)) {
      oldDict.targetWords.forEach((word: any) => {
        newDict.targetWords[word.hanzi] = {
          pinyin: word.pinyin,
          en: word.en,
          pt: word.pt
        };
      });
      
      newDict.progress!.levels[0].availableExamples = Object.keys(newDict.targetWords);
    }

    return newDict;
  };

  // Load from localStorage on mount
  useEffect(() => {
    const savedLevel = localStorage.getItem(STORAGE_KEYS.level);
    const savedCurrentLevels = localStorage.getItem(STORAGE_KEYS.currentLevels);
    const savedKnownWords = localStorage.getItem(STORAGE_KEYS.knownWords);
    const savedCaptions = localStorage.getItem(STORAGE_KEYS.captions);
    const savedDictionaries = localStorage.getItem(STORAGE_KEYS.dictionaries);

    let dictionaries = [DEFAULT_DICTIONARY];
    if (savedDictionaries) {
      try {
        const parsed = JSON.parse(savedDictionaries);
        dictionaries = parsed.map((dict: any) => migrateDictionary(dict));
      } catch (error) {
        console.error('Error parsing saved dictionaries:', error);
        dictionaries = [DEFAULT_DICTIONARY];
      }
    }

    // Initialize currentLevels with defaults for each dictionary
    let currentLevels: Record<string, number> = {};
    dictionaries.forEach(dict => {
      currentLevels[dict.id] = 1;
    });

    if (savedCurrentLevels) {
      try {
        const parsed = JSON.parse(savedCurrentLevels);
        currentLevels = { ...currentLevels, ...parsed };
      } catch (error) {
        console.error('Error parsing saved current levels:', error);
      }
    }

    setGameState(prev => ({
      ...prev,
      level: savedLevel ? parseInt(savedLevel) : 1,
      currentLevels,
      knownWords: savedKnownWords ? JSON.parse(savedKnownWords) : [],
      captions: savedCaptions ? {
        ...JSON.parse(savedCaptions),
        // Ensure soundEnabled is set for existing saves that don't have this property
        soundEnabled: JSON.parse(savedCaptions).soundEnabled ?? true
      } : {
        showPinyin: true,
        showEnglish: true,
        showPortuguese: false,
        soundEnabled: true
      },
      dictionaries
    }));
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.level, gameState.level.toString());
    localStorage.setItem(STORAGE_KEYS.currentLevels, JSON.stringify(gameState.currentLevels));
    localStorage.setItem(STORAGE_KEYS.knownWords, JSON.stringify(gameState.knownWords));
    localStorage.setItem(STORAGE_KEYS.captions, JSON.stringify(gameState.captions));
    localStorage.setItem(STORAGE_KEYS.dictionaries, JSON.stringify(gameState.dictionaries));
  }, [gameState]);

  const addKnownWord = (word: Word, onLevelUp?: (dictionaryName: string, newLevel: number) => void) => {
    setGameState(prev => {
      const newKnownWords = [...prev.knownWords, word];
      const newCurrentLevels = { ...prev.currentLevels };
      
      // Check level progression for each active dictionary
      prev.dictionaries.forEach(dict => {
        if (!dict.isActive || !dict.progress) return;
        
        const currentLevel = newCurrentLevels[dict.id] || 1;
        const maxLevel = dict.progress.levels.length;
        
        if (currentLevel < maxLevel) {
          // Get words discoverable up to current level
          const availableHanzi = getAvailableHanziForLevel(dict, currentLevel);
          const possibleWords = Object.keys(dict.targetWords).filter(wordHanzi => {
            return wordHanzi.split('').every(hanzi => availableHanzi.includes(hanzi));
          });
          
          // Count discovered words from this dictionary at current level
          const discoveredWords = newKnownWords.filter(kw => possibleWords.includes(kw.hanzi));
          
          // Check if should advance level
          const shouldAdvance = checkLevelAdvancement(dict, currentLevel, discoveredWords.length, possibleWords.length);
          
          if (shouldAdvance) {
            const newLevel = currentLevel + 1;
            newCurrentLevels[dict.id] = newLevel;
            
            // Trigger level up callback
            if (onLevelUp) {
              setTimeout(() => onLevelUp(dict.name, newLevel), 1000); // Delay to show after word celebration
            }
          }
        }
      });
      
      return {
        ...prev,
        knownWords: newKnownWords,
        currentLevels: newCurrentLevels
      };
    });
  };

  // Helper function to get available hanzi up to a specific level
  const getAvailableHanziForLevel = (dict: Dictionary, level: number): string[] => {
    if (!dict.progress) return Object.keys(dict.hanzi);
    
    const availableHanzi: string[] = [];
    for (let i = 0; i < level && i < dict.progress.levels.length; i++) {
      availableHanzi.push(...dict.progress.levels[i].hanzi);
    }
    return availableHanzi;
  };

  // Helper function to check if level should advance
  const checkLevelAdvancement = (dict: Dictionary, currentLevel: number, discoveredCount: number, possibleCount: number): boolean => {
    if (!dict.progress) return false;
    
    const rule = dict.progress.advanceRule;
    if (rule === "5_words_or_all_combos") {
      return discoveredCount >= 5 || discoveredCount >= possibleCount;
    }
    
    return false;
  };

  const togglePinyin = () => {
    setGameState(prev => ({
      ...prev,
      captions: { ...prev.captions, showPinyin: !prev.captions.showPinyin }
    }));
  };

  const toggleEnglish = () => {
    setGameState(prev => ({
      ...prev,
      captions: { ...prev.captions, showEnglish: !prev.captions.showEnglish }
    }));
  };

  const togglePortuguese = () => {
    setGameState(prev => ({
      ...prev,
      captions: { ...prev.captions, showPortuguese: !prev.captions.showPortuguese }
    }));
  };

  const toggleSound = () => {
    setGameState(prev => ({
      ...prev,
      captions: { ...prev.captions, soundEnabled: !prev.captions.soundEnabled }
    }));
  };

  const clearCanvas = () => {
    setGameState(prev => ({
      ...prev,
      canvasCards: []
    }));
  };

  const addCardToCanvas = (hanzi: string, x: number, y: number, word?: Word) => {
    const newCard: HanziCard = {
      id: `card-${Date.now()}-${Math.random()}`,
      hanzi,
      x,
      y,
      isOnCanvas: true,
      word
    };

    setGameState(prev => ({
      ...prev,
      canvasCards: [...prev.canvasCards, newCard]
    }));
  };

  const removeCardFromCanvas = (cardId: string) => {
    setGameState(prev => ({
      ...prev,
      canvasCards: prev.canvasCards.filter(card => card.id !== cardId)
    }));
  };

  const moveCardOnCanvas = (cardId: string, x: number, y: number) => {
    setGameState(prev => ({
      ...prev,
      canvasCards: prev.canvasCards.map(card => 
        card.id === cardId ? { ...card, x, y } : card
      )
    }));
  };

  const addDictionary = (dictionary: Dictionary) => {
    setGameState(prev => ({
      ...prev,
      dictionaries: [...prev.dictionaries, dictionary],
      currentLevels: {
        ...prev.currentLevels,
        [dictionary.id]: 1
      }
    }));
  };

  const toggleDictionary = (dictionaryId: string) => {
    setGameState(prev => {
      const activeDictionaries = prev.dictionaries.filter(d => d.isActive);
      
      // Prevent turning off the last active dictionary
      if (activeDictionaries.length === 1 && activeDictionaries[0].id === dictionaryId) {
        return prev;
      }

      return {
        ...prev,
        dictionaries: prev.dictionaries.map(dict => 
          dict.id === dictionaryId ? { ...dict, isActive: !dict.isActive } : dict
        )
      };
    });
  };

  const removeDictionary = (dictionaryId: string) => {
    setGameState(prev => {
      // Prevent removing default dictionary
      const dictionaryToRemove = prev.dictionaries.find(d => d.id === dictionaryId);
      if (dictionaryToRemove?.isDefault) {
        return prev;
      }

      const remainingDictionaries = prev.dictionaries.filter(dict => dict.id !== dictionaryId);
      
      // Ensure at least one dictionary remains active
      const activeRemaining = remainingDictionaries.filter(d => d.isActive);
      if (activeRemaining.length === 0) {
        // Activate the first remaining dictionary (which should be default)
        remainingDictionaries[0] = { ...remainingDictionaries[0], isActive: true };
      }

      return {
        ...prev,
        dictionaries: remainingDictionaries
      };
    });
  };

  // Helper function to reset progress
  const resetProgress = () => {
    setGameState(prev => {
      const newCurrentLevels: Record<string, number> = {};
      prev.dictionaries.forEach(dict => {
        newCurrentLevels[dict.id] = 1;
      });
      
      return {
        ...prev,
        level: 1,
        currentLevels: newCurrentLevels,
        knownWords: [],
        canvasCards: []
      };
    });
  };

  const getActiveDictionariesData = () => {
    const activeDictionaries = gameState.dictionaries.filter(d => d.isActive);
    
    const combined = {
      level1Hanzi: [] as string[],
      hanziPinyin: {} as Record<string, string>,
      hanziEnglish: {} as Record<string, string>,
      hanziPortuguese: {} as Record<string, string>,
      targetWords: [] as Word[]
    };

    activeDictionaries.forEach(dict => {
      // Get available hanzi based on current level for this dictionary
      const currentLevel = gameState.currentLevels[dict.id] || 1;
      const availableHanzi = getAvailableHanziForLevel(dict, currentLevel);
      
      combined.level1Hanzi.push(...availableHanzi);
      
      // Transform new format to legacy format for compatibility - only for available hanzi
      availableHanzi.forEach(hanzi => {
        const info = dict.hanzi[hanzi];
        if (info) {
          combined.hanziPinyin[hanzi] = info.pinyin;
          combined.hanziEnglish[hanzi] = info.en;
          combined.hanziPortuguese[hanzi] = info.pt;
        }
      });
      
      // Transform targetWords from new format to legacy format - only words that can be formed with available hanzi
      Object.entries(dict.targetWords).forEach(([hanzi, info]) => {
        const canForm = hanzi.split('').every(char => availableHanzi.includes(char));
        if (canForm) {
          combined.targetWords.push({
            hanzi,
            pinyin: info.pinyin,
            en: info.en,
            pt: info.pt
          });
        }
      });
    });

    // Remove duplicates
    combined.level1Hanzi = [...new Set(combined.level1Hanzi)];
    combined.targetWords = combined.targetWords.filter((word, index, self) => 
      index === self.findIndex(w => w.hanzi === word.hanzi)
    );

    return combined;
  };

  return {
    gameState,
    addKnownWord,
    togglePinyin,
    toggleEnglish,
    togglePortuguese,
    toggleSound,
    clearCanvas,
    addCardToCanvas,
    removeCardFromCanvas,
    moveCardOnCanvas,
    addDictionary,
    toggleDictionary,
    removeDictionary,
    resetProgress,
    getActiveDictionariesData,
    getAvailableHanziForLevel,
    checkLevelAdvancement
  };
}