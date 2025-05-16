'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, Music, Clock, BarChart3 } from 'lucide-react';
import AudioSpectrum from '@/components/ui/audio-spectrum';
import Image from 'next/image';

// Sample tracks for the library
const sampleTracks = [
  {
    id: 1,
    title: 'Ethereal Dreams',
    artist: 'Luna Waves',
    duration: 217, // 3:37
    audioUrl: '/assets/sample-1.mp3',
    coverImage: '/assets/album-covers/cover-1.jpg',
  },
  {
    id: 2,
    title: 'Neon City Nights',
    artist: 'Cyber Pulse',
    duration: 184, // 3:04
    audioUrl: '/assets/sample-2.mp3',
    coverImage: '/assets/album-covers/cover-2.jpg',
  },
  {
    id: 3,
    title: 'Solana Sunrise',
    artist: 'Blockchain Beats',
    duration: 252, // 4:12
    audioUrl: '/assets/sample-3.mp3',
    coverImage: '/assets/album-covers/cover-3.jpg',
  },
];

// Format track duration (seconds to MM:SS)
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const TrackItem = ({ track, isPlaying, onPlayPause, isActive }: { 
  track: typeof sampleTracks[0], 
  isPlaying: boolean, 
  onPlayPause: () => void,
  isActive: boolean
}) => {
  return (
    <div className={`flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-card/60' : 'hover:bg-card/30'}`}>
      <div className="w-12 h-12 rounded-md overflow-hidden relative mr-4 flex-shrink-0">
        <Image 
          src={track.coverImage}
          alt={track.title}
          fill
          className="object-cover"
        />
        <div className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white opacity-90"
            onClick={onPlayPause}
          >
            {isPlaying && isActive ? <Pause size={16} /> : <Play size={16} />}
          </Button>
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm text-foreground truncate">{track.title}</h3>
        <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
      </div>
      
      <div className="ml-4 text-xs text-muted-foreground flex-shrink-0">
        {formatDuration(track.duration)}
      </div>
    </div>
  );
};

export default function LibraryPage() {
  const [activeTrack, setActiveTrack] = useState<typeof sampleTracks[0] | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const handlePlayPause = (track: typeof sampleTracks[0]) => {
    if (activeTrack && activeTrack.id === track.id) {
      // Toggle play/pause for current track
      if (isPlaying) {
        audioRef.current?.pause();
      } else {
        audioRef.current?.play();
      }
      setIsPlaying(!isPlaying);
    } else {
      // Start playing new track
      setActiveTrack(track);
      setIsPlaying(true);
      // Audio element will autoplay the new track when src changes
    }
  };
  
  // Handle audio end
  const handleAudioEnd = () => {
    setIsPlaying(false);
    
    // Auto-play next track
    if (activeTrack) {
      const currentIndex = sampleTracks.findIndex(t => t.id === activeTrack.id);
      const nextIndex = (currentIndex + 1) % sampleTracks.length;
      setActiveTrack(sampleTracks[nextIndex]);
      setIsPlaying(true);
    }
  };
  
  return (
    <div className="container px-4 py-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-white">Your Music Library</h1>
        <p className="text-muted-foreground">Discover your favorite tracks with enhanced visualization.</p>
      </header>
      
      <Tabs defaultValue="tracks" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="tracks"><Music className="mr-2 h-4 w-4" /> Tracks</TabsTrigger>
          <TabsTrigger value="visualizer"><BarChart3 className="mr-2 h-4 w-4" /> Audio Spectrum</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tracks" className="space-y-4">
          <div className="bg-card/20 backdrop-blur-md rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recently Played</h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            
            <div className="space-y-2">
              {sampleTracks.map(track => (
                <TrackItem 
                  key={track.id}
                  track={track}
                  isPlaying={isPlaying && activeTrack?.id === track.id}
                  onPlayPause={() => handlePlayPause(track)}
                  isActive={activeTrack?.id === track.id}
                />
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="visualizer">
          <div className="bg-card/20 backdrop-blur-md rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Audio Spectrum Visualization</h2>
              <div className="text-sm text-muted-foreground">
                {activeTrack ? (
                  <span className="flex items-center gap-2">
                    <span>Now Playing:</span>
                    <span className="font-medium text-primary">{activeTrack.title}</span>
                    <span>by</span>
                    <span>{activeTrack.artist}</span>
                  </span>
                ) : (
                  <span>Select a track to visualize</span>
                )}
              </div>
            </div>
            
            {activeTrack && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden relative">
                    <Image 
                      src={activeTrack.coverImage}
                      alt={activeTrack.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold">{activeTrack.title}</h3>
                    <p className="text-muted-foreground">{activeTrack.artist}</p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="gap-2"
                        onClick={() => handlePlayPause(activeTrack)}
                      >
                        {isPlaying ? (
                          <>
                            <Pause size={16} />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play size={16} />
                            Play
                          </>
                        )}
                      </Button>
                      
                      <span className="text-sm text-muted-foreground">
                        <Clock className="inline mr-1 h-3 w-3" />
                        {formatDuration(activeTrack.duration)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="glass rounded-lg p-4">
                  <AudioSpectrum 
                    audioRef={audioRef}
                    isPlaying={isPlaying}
                    height={160}
                    barCount={100}
                    barColor="var(--color-primary)"
                    className="mb-4"
                  />
                  
                  <div className="text-center text-sm text-muted-foreground mt-2">
                    Real-time frequency spectrum visualization
                  </div>
                </div>
              </div>
            )}
            
            {!activeTrack && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Music className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Track Selected</h3>
                <p className="text-muted-foreground max-w-md">
                  Select a track from the Tracks tab to see the audio spectrum visualization in action.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Hidden audio element */}
      <audio 
        ref={audioRef} 
        src={activeTrack?.audioUrl} 
        onEnded={handleAudioEnd}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
}
