import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { CaptionSettings } from '../types/game';

interface LeftPanelProps {
  captions: CaptionSettings;
  onClear: () => void;
  onSettings: () => void;
  onDictionary: () => void;
  onTogglePinyin: () => void;
  onToggleEnglish: () => void;
  onTogglePortuguese: () => void;
  onToggleSound: () => void;
}

export function LeftPanel({ 
  captions, 
  onClear, 
  onSettings, 
  onDictionary, 
  onTogglePinyin,
  onToggleEnglish,
  onTogglePortuguese,
  onToggleSound
}: LeftPanelProps) {
  return (
    <div className="w-48 bg-gray-100 border-r border-gray-300 p-4 space-y-3">
      <Button 
        variant="outline" 
        className="w-full justify-start"
        onClick={onClear}
      >
        🗑️ Clear
      </Button>
      
      <Button 
        variant="outline" 
        className="w-full justify-start"
        onClick={onSettings}
      >
        ⚙️ Settings
      </Button>
      
      <Button 
        variant="outline" 
        className="w-full justify-start"
        onClick={onDictionary}
      >
        📚 Dictionary (ALL)
      </Button>
      
      <Separator />
      
      <div className="space-y-2">
        <Button 
          variant={captions.soundEnabled ? "default" : "outline"}
          className="w-full justify-start"
          onClick={onToggleSound}
        >
          {captions.soundEnabled ? '🔊' : '🔇'} Sound
        </Button>
      </div>
      
      <Separator />
      
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700 mb-3">Caption Settings</div>
        
        <Button 
          variant={captions.showPinyin ? "default" : "outline"}
          className="w-full justify-start text-sm"
          onClick={onTogglePinyin}
        >
          🔤 Pinyin
        </Button>
        
        <Button 
          variant={captions.showEnglish ? "default" : "outline"}
          className="w-full justify-start text-sm"
          onClick={onToggleEnglish}
        >
          🇺🇸 English
        </Button>
        
        <Button 
          variant={captions.showPortuguese ? "default" : "outline"}
          className="w-full justify-start text-sm"
          onClick={onTogglePortuguese}
        >
          🇧🇷 Português
        </Button>
      </div>
      
      <div className="text-xs text-gray-400 mt-4">
        * Dictionary & New word modal always show full info
      </div>
    </div>
  );
}