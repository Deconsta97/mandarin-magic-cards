import { DraggableCard } from './DraggableCard';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Word, CaptionSettings } from '../types/game';

interface RightPanelProps {
  captions: CaptionSettings;
  knownWords: Word[];
  showIndividualWords: boolean;
  levelHanzi: string[];
  hanziPinyin: Record<string, string>;
  hanziEnglish: Record<string, string>;
  hanziPortuguese: Record<string, string>;
  onToggleIndividualWords: () => void;
}

export function RightPanel({ 
  captions, 
  knownWords, 
  showIndividualWords,
  levelHanzi,
  hanziPinyin,
  hanziEnglish,
  hanziPortuguese,
  onToggleIndividualWords 
}: RightPanelProps) {
  
  // Get individual hanzi from discovered words if toggle is on
  const individualHanziFromWords = showIndividualWords 
    ? knownWords.flatMap(word => word.hanzi.split(''))
    : [];

  return (
    <div className="w-64 bg-gray-100 border-l border-gray-300 h-screen flex flex-col">
      {/* Progress indicator at top */}
      <div className="p-4 pb-2 border-b border-gray-300">
        <div className="text-xs text-gray-500">
          <div>Level: 1</div>
        </div>
      </div>
      
      {/* Header with toggle */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <h3>Available Cards</h3>
          {knownWords.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleIndividualWords}
              className="text-xs"
            >
              {showIndividualWords ? 'Hide' : 'Show'} Words
            </Button>
          )}
        </div>
      </div>
      
      {/* Scrollable card list */}
      <div className="flex-1 px-4 pb-4 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-2 pr-2">
            {/* Deduplicated individual hanzi - combine levelHanzi and individualHanziFromWords, remove duplicates */}
            {[...new Set([...levelHanzi, ...(showIndividualWords ? individualHanziFromWords : [])])].map((hanzi) => (
              <DraggableCard
                key={`hanzi-${hanzi}`}
                hanzi={hanzi}
                captions={captions}
                isSource={true}
                hanziPinyin={hanziPinyin}
                hanziEnglish={hanziEnglish}
                hanziPortuguese={hanziPortuguese}
              />
            ))}
            
            {/* Discovered words as composite cards */}
            {showIndividualWords && knownWords.map((word, index) => (
              <DraggableCard
                key={`word-${word.hanzi}-${index}`}
                hanzi={word.hanzi}
                word={word}
                captions={captions}
                isSource={true}
                hanziPinyin={hanziPinyin}
                hanziEnglish={hanziEnglish}
                hanziPortuguese={hanziPortuguese}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
      
      {/* Footer note */}
      {showIndividualWords && knownWords.length > 0 && (
        <div className="px-4 pb-4">
          <div className="text-xs text-gray-400">
            * Discovered words included
          </div>
        </div>
      )}
    </div>
  );
}