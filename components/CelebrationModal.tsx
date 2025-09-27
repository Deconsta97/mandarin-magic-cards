import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Word } from '../types/game';

interface CelebrationModalProps {
  isOpen: boolean;
  word: Word | null;
  onClose: () => void;
}

export function CelebrationModal({ isOpen, word, onClose }: CelebrationModalProps) {
  if (!word) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl text-yellow-600">
            🎉 TA-DA!! New word discovered 🎉
          </DialogTitle>
          <DialogDescription className="text-center">
            You have successfully formed a new word! See the details below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="text-center space-y-4 py-6">
          <div className="text-6xl" style={{ fontFamily: 'Noto Sans SC, sans-serif' }}>
            {word.hanzi}
          </div>
          
          <div className="space-y-2">
            <div className="text-xl font-medium text-blue-600">
              {word.pinyin}
            </div>
            <div className="text-lg text-gray-700">
              🇺🇸 {word.en}
            </div>
            <div className="text-lg text-gray-700">
              🇧🇷 {word.pt}
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button onClick={onClose} className="px-8">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}