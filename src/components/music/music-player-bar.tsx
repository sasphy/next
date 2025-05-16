'use client';

import WaveformPlayer from '@/components/music/waveform-player';
import { useMusicPlayer } from '@/components/music/music-player-context';
import { useCallback, useEffect, useState } from 'react';
import { SkipBack, SkipForward, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MusicPlayerBar = () => {
  const { currentTrack, isPlaying, pauseTrack, resumeTrack, nextTrack, previousTrack } = useMusicPlayer();
  const [minimized, setMinimized] = useState(false);
  const [visible, setVisible] = useState(false);

  // Show the player when a track is loaded
  useEffect(() => {
    if (currentTrack) {
      setVisible(true);
    }
  }, [currentTrack]);

  // Handle track end
  const handleTrackEnd = useCallback(() => {
    nextTrack();
  }, [nextTrack]);

  // If no track is playing, don't render anything
  if (!visible || !currentTrack) return null;

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-lg border-t border-purple-900/30 transition-all duration-300 ${
        minimized ? 'h-16' : 'h-auto sm:h-24'
      }`}
    >
      <div className="container mx-auto h-full">
        {minimized ? (
          <div className="flex items-center justify-between h-full px-4">
            <div className="flex items-center gap-3">
              {currentTrack.coverImage && (
                <img 
                  src={currentTrack.coverImage} 
                  alt={currentTrack.title} 
                  className="w-10 h-10 rounded-md object-cover"
                />
              )}
              <div>
                <h4 className="text-white font-medium text-sm line-clamp-1">{currentTrack.title}</h4>
                <p className="text-purple-300 text-xs">{currentTrack.artist}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full text-gray-300 hover:text-white hover:bg-purple-900/50"
                onClick={previousTrack}
              >
                <SkipBack size={16} />
              </Button>
              
              <Button
                size="icon"
                className="h-10 w-10 rounded-full bg-purple-600 text-white hover:bg-purple-700"
                onClick={isPlaying ? pauseTrack : resumeTrack}
              >
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                )}
              </Button>
              
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full text-gray-300 hover:text-white hover:bg-purple-900/50"
                onClick={nextTrack}
              >
                <SkipForward size={16} />
              </Button>
              
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full text-gray-300 hover:text-white hover:bg-purple-900/50 ml-2"
                onClick={() => setMinimized(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:px-6 sm:py-4 h-full">
            <div className="flex justify-between items-center mb-4 md:hidden">
              <h3 className="text-white font-semibold">Now Playing</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-white"
                onClick={() => setVisible(false)}
              >
                <X size={18} />
              </Button>
            </div>
            
            <div className="hidden md:block absolute top-2 right-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-gray-400 hover:text-white"
                onClick={() => setVisible(false)}
              >
                <X size={16} />
              </Button>
            </div>
            
            <WaveformPlayer
              audioUrl={currentTrack.fullAudioUrl || currentTrack.previewUrl || ''}
              title={currentTrack.title}
              artist={currentTrack.artist}
              coverArt={currentTrack.coverImage}
              autoPlay={isPlaying}
              onEnded={handleTrackEnd}
            />
            
            <div className="md:hidden">
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 text-xs hover:text-white mt-2 px-2"
                onClick={() => setMinimized(true)}
              >
                Minimize
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicPlayerBar;
