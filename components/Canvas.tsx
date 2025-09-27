import { useDrop } from 'react-dnd';
import { DraggableCard } from './DraggableCard';
import { LevelProgressBar } from './LevelProgressBar';
import { HanziCard, Word, CaptionSettings, Dictionary } from '../types/game';

interface CanvasProps {
  canvasCards: HanziCard[];
  captions: CaptionSettings;
  knownWords: Word[];
  progressCurrent: number;
  progressTotal: number;
  targetWords: Word[];
  hanziPinyin: Record<string, string>;
  hanziEnglish: Record<string, string>;
  hanziPortuguese: Record<string, string>;
  currentLevels: Record<string, number>;
  activeDictionaries: Dictionary[];
  onDropCard: (hanzi: string, x: number, y: number, word?: Word) => void;
  onMoveCard: (cardId: string, x: number, y: number) => void;
  onNewWord: (word: Word) => void;
  onRemoveCard: (cardId: string) => void;
}

export function Canvas({ 
  canvasCards, 
  captions, 
  knownWords,
  progressCurrent,
  progressTotal,
  targetWords,
  hanziPinyin,
  hanziEnglish,
  hanziPortuguese,
  currentLevels,
  activeDictionaries,
  onDropCard, 
  onMoveCard,
  onNewWord,
  onRemoveCard
}: CanvasProps) {
  const [{ isOver }, drop] = useDrop({
    accept: 'hanzi-card',
    drop: (item: { 
      hanzi: string; 
      word?: Word; 
      isSource: boolean; 
      cardId?: string; 
      isCanvasCard?: boolean 
    }, monitor) => {
      const offset = monitor.getClientOffset();
      const canvasElement = document.querySelector('.canvas-area');
      const canvasRect = canvasElement?.getBoundingClientRect();
      
      if (offset && canvasRect) {
        let x = offset.x - canvasRect.left - 60; // Center the card
        let y = offset.y - canvasRect.top - 80;
        
        // If this is a canvas card being moved, handle merging or just move
        if (item.isCanvasCard && item.cardId) {
          const overlappingCards = findOverlappingCards(x, y).filter(card => card.id !== item.cardId);
          
          if (overlappingCards.length > 0) {
            // Try to merge with overlapping card
            // Follow natural reading order: [existing card][dropped card]
            const targetCard = overlappingCards[0];
            const mergedHanzi = targetCard.hanzi + item.hanzi;
            
            // Check if this combination forms a valid word
            const wordData = targetWords.find(w => w.hanzi === mergedHanzi);
            
            if (wordData) {
              const finalHanzi = mergedHanzi;
              
              // Remove both cards
              onRemoveCard(item.cardId);
              if (targetCard.id) {
                onRemoveCard(targetCard.id);
              }
              
              // Add merged card at target position
              setTimeout(() => {
                const isKnownWord = knownWords.some(kw => kw.hanzi === finalHanzi);
                if (isKnownWord) {
                  // Just merge without celebration
                  onDropCard(finalHanzi, targetCard.x || 0, targetCard.y || 0, wordData);
                } else {
                  // New word - will trigger celebration
                  onDropCard(finalHanzi, targetCard.x || 0, targetCard.y || 0, wordData);
                  setTimeout(() => onNewWord(wordData!), 100);
                }
              }, 50);
              
              return;
            }
          }
          
          // No merge possible, just move the card
          onMoveCard(item.cardId, x, y);
          return;
        }
        
        // Handle multi-hanzi words - keep as single card if it's a known word
        if (item.hanzi.length > 1 && !item.isCanvasCard) {
          // Check if this is a known word
          const isKnownWord = knownWords.some(w => w.hanzi === item.hanzi) || 
                             targetWords.some(w => w.hanzi === item.hanzi);
          
          if (isKnownWord) {
            // Place as single card
            onDropCard(item.hanzi, x, y, item.word);
          } else {
            // Split into individual cards
            const hanziChars = item.hanzi.split('');
            hanziChars.forEach((hanzi, index) => {
              const cardX = x + (index * 125); // Space cards 125px apart
              onDropCard(hanzi, cardX, y);
            });
          }
          
          // Check for words after placing all cards
          setTimeout(() => {
            checkAndFormWords();
          }, 100);
          
          return;
        }
        
        // For cards from source, check if they can merge with overlapping cards
        if (!item.isCanvasCard) {
          const overlappingCards = findOverlappingCards(x, y);
          
          if (overlappingCards.length > 0) {
            // Try to merge with overlapping card
            // Follow natural reading order: [existing card][dropped card]
            const targetCard = overlappingCards[0];
            const mergedHanzi = targetCard.hanzi + item.hanzi;
            
            // Check if this combination forms a valid word
            const wordData = targetWords.find(w => w.hanzi === mergedHanzi);
            
            if (wordData) {
              const finalHanzi = mergedHanzi;
              
              // Remove the existing card
              if (targetCard.id) {
                onRemoveCard(targetCard.id);
              }
              
              // Add merged card at target position
              setTimeout(() => {
                const isKnownWord = knownWords.some(kw => kw.hanzi === finalHanzi);
                if (isKnownWord) {
                  // Just merge without celebration
                  onDropCard(finalHanzi, targetCard.x || 0, targetCard.y || 0, wordData);
                } else {
                  // New word - will trigger celebration
                  onDropCard(finalHanzi, targetCard.x || 0, targetCard.y || 0, wordData);
                  setTimeout(() => onNewWord(wordData!), 100);
                }
              }, 50);
              
              return;
            }
          }
          
          // No merge possible, just place the card
          onDropCard(item.hanzi, x, y, item.word);
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const findOverlappingCards = (x: number, y: number): HanziCard[] => {
    const cardWidth = 120;
    const cardHeight = 160;
    
    return canvasCards.filter(card => {
      const cardX = card.x || 0;
      const cardY = card.y || 0;
      
      // Check if the dropped card overlaps with this card's bounds
      return !(x >= cardX + cardWidth || 
               x + cardWidth <= cardX || 
               y >= cardY + cardHeight || 
               y + cardHeight <= cardY);
    });
  };



  // Simplified word checking - only used for detecting new words formed by adjacent cards
  // Merging is now handled directly in drop logic
  const checkAndFormWords = () => {
    const words = checkForWords(canvasCards);
    
    words.forEach(wordHanzi => {
      const wordData = targetWords.find(w => w.hanzi === wordHanzi);
      if (wordData && !knownWords.some(kw => kw.hanzi === wordHanzi)) {
        // Only trigger for truly new words (this handles edge cases where cards are placed adjacent)
        onNewWord(wordData);
      }
    });
  };

  const checkForWords = (cards: HanziCard[]): string[] => {
    const words: string[] = [];
    
    // Sort cards by x position for left-to-right reading
    const sortedCards = [...cards].sort((a, b) => (a.x || 0) - (b.x || 0));
    
    // Check for 2-hanzi words
    for (let i = 0; i < sortedCards.length - 1; i++) {
      const card1 = sortedCards[i];
      const card2 = sortedCards[i + 1];
      
      // Check if cards are positioned to form a word (close horizontally, same vertical level)
      if (Math.abs((card1.x || 0) - (card2.x || 0)) < 130 && 
          Math.abs((card1.y || 0) - (card2.y || 0)) < 50) {
        const twoHanziWord = card1.hanzi + card2.hanzi;
        if (targetWords.some(w => w.hanzi === twoHanziWord)) {
          words.push(twoHanziWord);
          
          // Check for 3-hanzi words
          if (i < sortedCards.length - 2) {
            const card3 = sortedCards[i + 2];
            if (Math.abs((card2.x || 0) - (card3.x || 0)) < 130 && 
                Math.abs((card2.y || 0) - (card3.y || 0)) < 50) {
              const threeHanziWord = twoHanziWord + card3.hanzi;
              if (targetWords.some(w => w.hanzi === threeHanziWord)) {
                words.push(threeHanziWord);
              }
            }
          }
        }
      }
    }
    
    return words;
  };

  const getWordForCard = (hanzi: string): Word | undefined => {
    // For single hanzi, no word data
    if (hanzi.length === 1) return undefined;
    
    // For multi-hanzi, find the word data from known words first, then target words
    return knownWords.find(w => w.hanzi === hanzi) || 
           targetWords.find(w => w.hanzi === hanzi);
  };



  return (
    <div
      ref={drop}
      className={`
        canvas-area flex-1 bg-gray-50 border-2 border-dashed border-gray-300 
        rounded-lg relative min-h-[400px] mx-4
        ${isOver ? 'border-blue-400 bg-blue-50' : ''}
      `}
    >
      {/* Floating Progress Bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <LevelProgressBar
          activeDictionaries={activeDictionaries}
          currentLevels={currentLevels}
          knownWords={progressCurrent}
          totalWords={progressTotal}
        />
      </div>

      <div className="absolute top-20 left-4 text-gray-500 text-sm">
        Drop Hanzi cards here to form words
      </div>
      
      {canvasCards.map((card, index) => (
        <DraggableCard
          key={card.id || `${card.hanzi}-${index}`}
          hanzi={card.hanzi}
          word={card.word || getWordForCard(card.hanzi)}
          captions={captions}
          onCanvas={true}
          x={card.x}
          y={card.y}
          cardId={card.id}
          onRemove={onRemoveCard}
          hanziPinyin={hanziPinyin}
          hanziEnglish={hanziEnglish}
          hanziPortuguese={hanziPortuguese}
        />
      ))}
    </div>
  );
}