import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Word } from '../types/game';

interface DictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetWords: Word[];
}

export function DictionaryModal({ isOpen, onClose, targetWords }: DictionaryModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            📚 Dictionary (Active)
          </DialogTitle>
          <DialogDescription className="text-center">
            Browse all available words from active dictionaries
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4">
            {targetWords.map((word, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl" style={{ fontFamily: 'Noto Sans SC, sans-serif' }}>
                    {word.hanzi}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="text-lg font-medium text-blue-600">
                      {word.pinyin}
                    </div>
                    <div className="text-gray-700">
                      🇺🇸 {word.en}
                    </div>
                    <div className="text-gray-700">
                      🇧🇷 {word.pt}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}