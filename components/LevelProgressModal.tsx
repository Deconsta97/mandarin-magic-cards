import { useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Badge } from './ui/badge';
import { Star, Sparkles, BookOpen } from 'lucide-react';

interface LevelProgressModalProps {
  isOpen: boolean;
  dictionaryName: string;
  newLevel: number;
  onClose: () => void;
}

export function LevelProgressModal({ 
  isOpen, 
  dictionaryName, 
  newLevel, 
  onClose 
}: LevelProgressModalProps) {
  // Auto-close after 4 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300">
        <div className="text-center space-y-4">
          {/* Animated Icon */}
          <div className="relative mx-auto w-16 h-16 mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center">
              <Star className="w-8 h-8 text-amber-500" fill="currentColor" />
            </div>
            {/* Sparkle effects */}
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-orange-400 animate-bounce" />
            <Sparkles className="absolute -bottom-2 -left-2 w-4 h-4 text-amber-400 animate-bounce delay-150" />
          </div>

          <DialogTitle className="text-2xl font-bold text-amber-800">
            🎉 New Level Unlocked!
          </DialogTitle>
          
          <DialogDescription asChild>
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600" />
                <span className="text-lg text-amber-700 font-medium">
                  {dictionaryName}
                </span>
              </div>
              
              <div className="text-center">
                <Badge variant="secondary" className="bg-amber-200 text-amber-800 text-lg py-1 px-3">
                  Level {newLevel}
                </Badge>
              </div>
              
              <p className="text-amber-700 font-medium">
                You've unlocked new Hanzi cards!
              </p>
              
              <p className="text-sm text-amber-600">
                Check the right panel for new cards to discover more words.
              </p>
            </div>
          </DialogDescription>
        </div>
      </DialogContent>
    </Dialog>
  );
}