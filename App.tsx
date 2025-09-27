import { useState, useMemo } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { LeftPanel } from "./components/LeftPanel";
import { Canvas } from "./components/Canvas";
import { RightPanel } from "./components/RightPanel";
import { CelebrationModal } from "./components/CelebrationModal";
import { LevelProgressModal } from "./components/LevelProgressModal";
import { DictionaryModal } from "./components/DictionaryModal";
import { SettingsModal } from "./components/SettingsModal";
import { useGameState } from "./hooks/useGameState";
import { useSound } from "./hooks/useSound";
import { Word } from "./types/game";

export default function App() {
  const {
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
  } = useGameState();

  const [celebrationWord, setCelebrationWord] =
    useState<Word | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showDictionary, setShowDictionary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showIndividualWords, setShowIndividualWords] =
    useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState<{
    dictionaryName: string;
    level: number;
  } | null>(null);
  const [showLevelProgress, setShowLevelProgress] =
    useState(false);

  // Memoize active dictionaries data to prevent expensive recalculations
  const activeDictionariesData = useMemo(() => {
    return getActiveDictionariesData();
  }, [gameState.dictionaries]);

  // Initialize sound system
  const { playCelebrationSound, playLevelUpSound } = useSound(
    gameState.captions.soundEnabled,
  );

  const handleNewWord = (word: Word) => {
    // Add known word with level progression callback
    addKnownWord(
      word,
      (dictionaryName: string, newLevel: number) => {
        setLevelUpInfo({ dictionaryName, level: newLevel });
        setShowLevelProgress(true);
        playLevelUpSound();
      },
    );

    setCelebrationWord(word);
    setShowCelebration(true);

    // Play celebration sound for new word discovery
    playCelebrationSound();
  };

  const handleCloseCelebration = () => {
    setShowCelebration(false);
    setCelebrationWord(null);
  };

  const handleCloseLevelProgress = () => {
    setShowLevelProgress(false);
    setLevelUpInfo(null);
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  const handleToggleDictionary = (id: string) => {
    toggleDictionary(id);
    clearCanvas(); // Clear canvas when dictionaries change to prevent bugs
  };

  const handleAddDictionary = (dictionary: any) => {
    addDictionary(dictionary);
    clearCanvas(); // Clear canvas when new dictionary is added to prevent bugs
  };

  const handleRemoveDictionary = (id: string) => {
    removeDictionary(id);
    clearCanvas(); // Clear canvas when dictionary is removed to prevent bugs
  };

  const handleDropCard = (
    hanzi: string,
    x: number,
    y: number,
    word?: Word,
  ) => {
    addCardToCanvas(hanzi, x, y, word);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex bg-white">
        <LeftPanel
          captions={gameState.captions}
          onClear={clearCanvas}
          onSettings={handleSettings}
          onDictionary={() => setShowDictionary(true)}
          onTogglePinyin={togglePinyin}
          onToggleEnglish={toggleEnglish}
          onTogglePortuguese={togglePortuguese}
          onToggleSound={toggleSound}
        />

        <Canvas
          canvasCards={gameState.canvasCards}
          captions={gameState.captions}
          knownWords={gameState.knownWords}
          progressCurrent={gameState.knownWords.length}
          progressTotal={
            activeDictionariesData.targetWords.length
          }
          targetWords={activeDictionariesData.targetWords}
          hanziPinyin={activeDictionariesData.hanziPinyin}
          hanziEnglish={activeDictionariesData.hanziEnglish}
          hanziPortuguese={
            activeDictionariesData.hanziPortuguese
          }
          currentLevels={gameState.currentLevels}
          activeDictionaries={gameState.dictionaries.filter(
            (d) => d.isActive,
          )}
          onDropCard={handleDropCard}
          onMoveCard={moveCardOnCanvas}
          onNewWord={handleNewWord}
          onRemoveCard={removeCardFromCanvas}
        />

        <RightPanel
          captions={gameState.captions}
          knownWords={gameState.knownWords}
          showIndividualWords={showIndividualWords}
          levelHanzi={activeDictionariesData.level1Hanzi}
          hanziPinyin={activeDictionariesData.hanziPinyin}
          hanziEnglish={activeDictionariesData.hanziEnglish}
          hanziPortuguese={
            activeDictionariesData.hanziPortuguese
          }
          onToggleIndividualWords={() =>
            setShowIndividualWords(!showIndividualWords)
          }
        />

        <CelebrationModal
          isOpen={showCelebration}
          word={celebrationWord}
          onClose={handleCloseCelebration}
        />

        <LevelProgressModal
          isOpen={showLevelProgress}
          dictionaryName={levelUpInfo?.dictionaryName || ""}
          newLevel={levelUpInfo?.level || 1}
          onClose={handleCloseLevelProgress}
        />

        <DictionaryModal
          isOpen={showDictionary}
          onClose={() => setShowDictionary(false)}
          targetWords={activeDictionariesData.targetWords}
        />

        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          dictionaries={gameState.dictionaries}
          onToggleDictionary={handleToggleDictionary}
          onAddDictionary={handleAddDictionary}
          onRemoveDictionary={handleRemoveDictionary}
          onResetProgress={resetProgress}
        />
      </div>
    </DndProvider>
  );
}