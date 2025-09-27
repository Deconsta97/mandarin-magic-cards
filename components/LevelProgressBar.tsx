import { useMemo } from 'react';
import { Dictionary } from '../types/game';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Star, Lock, CheckCircle } from 'lucide-react';

interface LevelProgressBarProps {
  activeDictionaries: Dictionary[];
  currentLevels: Record<string, number>;
  knownWords: number;
  totalWords: number;
}

interface LevelMarker {
  position: number;
  level: number;
  isUnlocked: boolean;
  isActive: boolean;
  dictionaryName: string;
  wordCount: number;
}

export function LevelProgressBar({ 
  activeDictionaries, 
  currentLevels, 
  knownWords, 
  totalWords 
}: LevelProgressBarProps) {
  
  const levelMarkers = useMemo(() => {
    const markers: LevelMarker[] = [];
    
    // For now, focus on the primary dictionary for simplicity
    const primaryDict = activeDictionaries[0];
    if (!primaryDict?.progress) return markers;
    
    const currentLevel = currentLevels[primaryDict.id] || 1;
    const totalLevels = primaryDict.progress.levels.length;
    
    primaryDict.progress.levels.forEach((level, index) => {
      const levelNumber = index + 1;
      const position = totalLevels === 1 ? 50 : (index / (totalLevels - 1)) * 100;
      
      markers.push({
        position,
        level: levelNumber,
        isUnlocked: levelNumber <= currentLevel,
        isActive: levelNumber === currentLevel,
        dictionaryName: primaryDict.name.split(' ')[0], // Shortened name
        wordCount: level.availableExamples?.length || 0
      });
    });
    
    return markers;
  }, [activeDictionaries, currentLevels]);
  
  // Calculate progress based on level progression rather than just word count
  const progressPercentage = useMemo(() => {
    if (activeDictionaries.length === 0) return 0;
    
    const primaryDict = activeDictionaries[0];
    if (!primaryDict?.progress) return 0;
    
    const currentLevel = currentLevels[primaryDict.id] || 1;
    const totalLevels = primaryDict.progress.levels.length;
    
    // Base progress on current level completion
    const levelProgress = ((currentLevel - 1) / totalLevels) * 100;
    
    // Add partial progress within current level based on words discovered
    const currentLevelWords = primaryDict.progress.levels
      .slice(0, currentLevel)
      .reduce((total, level) => total + (level.availableExamples?.length || 0), 0);
    
    const totalPossibleWords = primaryDict.progress.levels
      .reduce((total, level) => total + (level.availableExamples?.length || 0), 0);
    
    const wordProgress = totalPossibleWords > 0 ? (knownWords / totalPossibleWords) * 100 : 0;
    
    return Math.min(wordProgress, 100);
  }, [activeDictionaries, currentLevels, knownWords]);
  
  const getDictionaryProgress = () => {
    return activeDictionaries.map(dict => {
      const currentLevel = currentLevels[dict.id] || 1;
      const maxLevel = dict.progress?.levels.length || 1;
      const progressInDict = (currentLevel / maxLevel) * 100;
      
      return {
        name: dict.name,
        currentLevel,
        maxLevel,
        progress: progressInDict,
        color: dict.id.includes('hsk') ? 'bg-blue-500' : 'bg-green-500'
      };
    });
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-3 shadow-lg min-w-[400px]">
      <div className="space-y-3 p-[0px]">
        {/* Main Progress Info */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Dictionary Progress
          </span>
          <span className="text-xs text-gray-500">
            {knownWords}/{totalWords} words discovered
          </span>
        </div>
        
        {/* Level Progress Bar with Markers */}
        <div className="relative">
          {/* Base Progress Bar */}
          <div className="relative h-4 bg-gray-200 rounded-full overflow-visible">
            {/* Overall Progress Fill */}
            <div 
              className="h-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 transition-all duration-700 ease-out shadow-inner rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
            
            {/* Level Markers */}
            {levelMarkers.map((marker, index) => (
              <div
                key={index}
                className="absolute top-0 transform -translate-x-1/2 group"
                style={{ left: `${marker.position}%` }}
              >
                {/* Marker Line */}
                <div className={`w-0.5 h-4 ${marker.isUnlocked ? 'bg-white' : 'bg-gray-500'}`} />
                
                {/* Marker Icon */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
                    marker.isUnlocked 
                      ? marker.isActive 
                        ? 'bg-yellow-400 border-yellow-500 animate-pulse' 
                        : 'bg-green-400 border-green-500'
                      : 'bg-gray-300 border-gray-400'
                  }`}>
                    {marker.isUnlocked ? (
                      marker.isActive ? (
                        <Star className="w-3 h-3 text-yellow-800 fill-current" />
                      ) : (
                        <CheckCircle className="w-3 h-3 text-green-800" />
                      )
                    ) : (
                      <Lock className="w-2.5 h-2.5 text-gray-600" />
                    )}
                  </div>
                </div>
                
                {/* Level Number Below */}
                <div className="absolute top-5 left-1/2 transform -translate-x-1/2">
                  <span className={`text-xs font-medium ${
                    marker.isActive ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {marker.level}
                  </span>
                </div>
                
                {/* Enhanced Tooltip on Hover */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                    <div className="font-medium">Level {marker.level}</div>
                    <div className="text-gray-300">{marker.dictionaryName}</div>
                    {marker.wordCount > 0 && (
                      <div className="text-gray-400">{marker.wordCount} words</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Dictionary Details */}
        <div className="space-y-1">
          {getDictionaryProgress().map((dict, index) => (
            <div key={index} className="flex items-center gap-2 text-xs mt-6">
              <div className={`w-2 h-2 rounded-full ${dict.color}`} />
              <span className="font-medium text-gray-700">{dict.name.split(' ')[0]}</span>
              <span className="text-gray-500">
                Level {dict.currentLevel}/{dict.maxLevel}
              </span>
              <div className="flex-1" />
              <Badge 
                variant="secondary" 
                className="text-xs px-2 py-0"
              >
                {Math.round(dict.progress)}%
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}