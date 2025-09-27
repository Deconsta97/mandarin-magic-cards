import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Upload, FileText, CheckCircle, AlertCircle, Trash2, RotateCcw } from 'lucide-react';
import { Dictionary } from '../types/game';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dictionaries: Dictionary[];
  onToggleDictionary: (dictionaryId: string) => void;
  onAddDictionary: (dictionary: Dictionary) => void;
  onRemoveDictionary: (dictionaryId: string) => void;
  onResetProgress: () => void;
}

export function SettingsModal({ 
  isOpen, 
  onClose, 
  dictionaries, 
  onToggleDictionary, 
  onAddDictionary,
  onRemoveDictionary,
  onResetProgress
}: SettingsModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jsonError, setJsonError] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setSelectedFile(file);
        setJsonError('');
      } else {
        setJsonError('Please select a valid JSON file');
        setSelectedFile(null);
      }
    }
  };

  const handleImportDictionary = async () => {
    if (!selectedFile) return;

    try {
      const text = await selectedFile.text();
      const data = JSON.parse(text);
      
      // Basic validation of dictionary structure
      if (!data.name || !data.hanzi || !data.targetWords) {
        setJsonError('Invalid dictionary format. Required fields: name, hanzi, targetWords');
        return;
      }

      // Validate hanzi format
      if (typeof data.hanzi !== 'object' || Object.keys(data.hanzi).length === 0) {
        setJsonError('Invalid hanzi format. Must be an object with hanzi characters as keys');
        return;
      }

      // Validate targetWords format
      if (typeof data.targetWords !== 'object' || Object.keys(data.targetWords).length === 0) {
        setJsonError('Invalid targetWords format. Must be an object with words as keys');
        return;
      }

      // Validate hanzi entries have required fields
      for (const [hanzi, info] of Object.entries(data.hanzi)) {
        if (!info || typeof info !== 'object' || !info.pinyin || !info.en || !info.pt) {
          setJsonError(`Invalid hanzi entry for "${hanzi}". Required fields: pinyin, en, pt`);
          return;
        }
      }

      // Validate targetWords entries have required fields
      for (const [word, info] of Object.entries(data.targetWords)) {
        if (!info || typeof info !== 'object' || !info.pinyin || !info.en || !info.pt) {
          setJsonError(`Invalid targetWords entry for "${word}". Required fields: pinyin, en, pt`);
          return;
        }
      }

      // Create dictionary object
      const newDictionary: Dictionary = {
        id: `custom-${Date.now()}`,
        name: data.name,
        description: data.description || 'Custom imported dictionary',
        hanzi: data.hanzi,
        targetWords: data.targetWords,
        isActive: true,
        isDefault: false
      };

      onAddDictionary(newDictionary);
      
      // Reset file input
      setSelectedFile(null);
      const fileInput = document.getElementById('dictionary-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // Show success message (you can implement toast notification later)
      alert('Dictionary imported successfully!');
      
    } catch (error) {
      setJsonError('Invalid JSON format');
      console.error('JSON parse error:', error);
    }
  };

  const activeDictionaries = dictionaries.filter(d => d.isActive);
  const canToggleOff = (dictionaryId: string) => {
    return activeDictionaries.length > 1 || !activeDictionaries.some(d => d.id === dictionaryId);
  };

  const handleDeleteDictionary = (dictionary: Dictionary) => {
    if (confirm(`Are you sure you want to delete the "${dictionary.name}" dictionary? This action cannot be undone.`)) {
      onRemoveDictionary(dictionary.id);
    }
  };

  const handleResetProgress = () => {
    if (confirm('Are you sure you want to reset all progress? This will clear all known words and current level progress. Custom dictionaries will be preserved. This action cannot be undone.')) {
      onResetProgress();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[50%] h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 p-6 pb-4">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              ⚙️ Settings
            </DialogTitle>
            <DialogDescription className="text-center">
              Manage your dictionaries and game preferences
            </DialogDescription>
          </DialogHeader>
        </div>
        
        {/* Main Content - Scrollable */}
        <div className="flex-1 min-h-0 px-6 overflow-hidden">
          <ScrollArea className="h-full w-full pr-4">
            <div className="flex flex-col space-y-6 pb-6">
              
              {/* My Dictionaries Section */}
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">📚 My Dictionaries</h3>
                  {activeDictionaries.length === 1 && (
                    <div className="flex items-center text-xs text-amber-600">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      At least one dictionary must be active
                    </div>
                  )}
                </div>
                
                {/* Dictionary Cards */}
                <div className="flex flex-col space-y-3">
                  {dictionaries.map((dictionary) => (
                    <Card key={dictionary.id} className="flex-shrink-0">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base truncate">{dictionary.name}</CardTitle>
                            <CardDescription className="text-sm line-clamp-2">
                              {dictionary.description}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {dictionary.isActive && (
                              <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            )}
                            <div className="flex items-center space-x-2">
                              <Label htmlFor={`toggle-${dictionary.id}`} className="text-sm">
                                {dictionary.isActive ? 'On' : 'Off'}
                              </Label>
                              <Switch
                                id={`toggle-${dictionary.id}`}
                                checked={dictionary.isActive}
                                onCheckedChange={() => onToggleDictionary(dictionary.id)}
                                disabled={!canToggleOff(dictionary.id)}
                              />
                            </div>
                            {!dictionary.isDefault && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteDictionary(dictionary)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span>{Object.keys(dictionary.hanzi).length} hanzi characters</span>
                          <span>•</span>
                          <span>{Object.keys(dictionary.targetWords).length} target words</span>
                          {dictionary.isDefault && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600">Default</span>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Import New Dictionary */}
                <div className="flex flex-col space-y-4">
                  <h4 className="font-medium">Import Custom Dictionary</h4>
                  
                  <div className="flex flex-col space-y-3">
                    <Label htmlFor="dictionary-file">Select JSON Dictionary File</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="dictionary-file"
                        type="file"
                        accept=".json,application/json"
                        onChange={handleFileChange}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleImportDictionary}
                        disabled={!selectedFile}
                        className="flex-shrink-0"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                      </Button>
                    </div>
                    
                    {selectedFile && (
                      <div className="flex items-center text-sm text-green-600">
                        <FileText className="w-4 h-4 mr-2" />
                        {selectedFile.name} selected
                      </div>
                    )}
                    
                    {jsonError && (
                      <div className="text-sm text-red-600">
                        {jsonError}
                      </div>
                    )}
                  </div>

                  {/* Dictionary Format Info */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Dictionary Format</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-xs font-mono bg-white p-3 rounded border overflow-x-auto">
                        <pre className="whitespace-pre-wrap break-all">{`{
  "id": "custom-hsk-demo",
  "name": "HSK 1 — Demo (7 Hanzi + Levels)",
  "description": "Progressive demo: hanzi unlock in 2 levels. Advance every 5 words or when all combos found.",
  "isActive": true,
  "hanzi": {
    "中": { "pinyin": "Zhōng", "en": "middle; central", "pt": "meio; central" },
    "国": { "pinyin": "guó", "en": "country; nation", "pt": "país; nação" },
    "人": { "pinyin": "rén", "en": "person", "pt": "pessoa" },
    "们": { "pinyin": "men", "en": "plural suffix", "pt": "sufixo de plural" },
    "水": { "pinyin": "shuǐ", "en": "water", "pt": "água" },
    "口": { "pinyin": "kǒu", "en": "mouth", "pt": "boca" },
    "火": { "pinyin": "huǒ", "en": "fire", "pt": "fogo" }
  },
  "targetWords": {
    "中国": { "pinyin": "Zhōngguó", "en": "China (country)", "pt": "China (país)" },
    "中国人": { "pinyin": "Zhōngguó rén", "en": "Chinese person", "pt": "pessoa chinesa" },
    "人人": { "pinyin": "rénrén", "en": "everyone", "pt": "todo mundo" },
    "人口": { "pinyin": "rénkǒu", "en": "population", "pt": "população" },
    "我们": { "pinyin": "wǒmen", "en": "we; us", "pt": "nós" },
    "你们": { "pinyin": "nǐmen", "en": "you (plural)", "pt": "vocês" },
    "口水": { "pinyin": "kǒushuǐ", "en": "saliva", "pt": "saliva" },
    "水火": { "pinyin": "shuǐhuǒ", "en": "water and fire", "pt": "água e fogo" }
  },
  "progress": {
    "advanceRule": "5_words_or_all_combos",
    "levels": [
      {
        "id": 1,
        "hanzi": ["中", "国", "人", "们"],
        "notes": "Level 1: Basic characters and nationality terms",
        "availableExamples": ["中国", "中国人", "人人", "我们", "你们"]
      },
      {
        "id": 2,
        "hanzi": ["水", "口", "火"],
        "notes": "Level 2: Elements and body parts",
        "availableExamples": ["人口", "口水", "水火"]
      }
    ]
  }
}`}</pre>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Game Settings Section */}
              <div className="flex flex-col space-y-4">
                <h3 className="text-lg font-semibold">🎮 Game Settings</h3>
                
                <Card className="bg-red-50 border-red-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-red-800">Reset Progress</CardTitle>
                    <CardDescription className="text-red-700">
                      Clear all discovered words and level progress. Custom dictionaries will be preserved.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      onClick={handleResetProgress}
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset All Progress
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Future sections can be added here */}
              {/* Appearance Settings, etc. */}
              
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}