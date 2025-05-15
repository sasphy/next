'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface Track {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  audioUrl: string;
  mintAddress?: string;
}

interface MusicPlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTrackId: string | null;
  queue: Track[];
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const MusicPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);

  const playTrack = useCallback((track: Track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(true);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  }, [currentTrack]);

  const pauseTrack = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const resumeTrack = useCallback(() => {
    if (currentTrack) {
      setIsPlaying(true);
    }
  }, [currentTrack]);

  const nextTrack = useCallback(() => {
    if (queue.length === 0 || !currentTrack) return;

    const currentIndex = queue.findIndex(track => track.id === currentTrack.id);
    if (currentIndex === -1 || currentIndex === queue.length - 1) {
      // If current track is not in queue or is the last track, do nothing
      return;
    }

    const nextTrack = queue[currentIndex + 1];
    setCurrentTrack(nextTrack);
    setIsPlaying(true);
  }, [queue, currentTrack]);

  const previousTrack = useCallback(() => {
    if (queue.length === 0 || !currentTrack) return;

    const currentIndex = queue.findIndex(track => track.id === currentTrack.id);
    if (currentIndex <= 0) {
      // If current track is not in queue or is the first track, do nothing
      return;
    }

    const prevTrack = queue[currentIndex - 1];
    setCurrentTrack(prevTrack);
    setIsPlaying(true);
  }, [queue, currentTrack]);

  const addToQueue = useCallback((track: Track) => {
    setQueue(prevQueue => {
      // Check if track already exists in queue
      if (prevQueue.some(t => t.id === track.id)) {
        return prevQueue;
      }
      return [...prevQueue, track];
    });
  }, []);

  const removeFromQueue = useCallback((trackId: string) => {
    setQueue(prevQueue => prevQueue.filter(track => track.id !== trackId));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  return (
    <MusicPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTrackId: currentTrack?.id || null,
        queue,
        playTrack,
        pauseTrack,
        resumeTrack,
        nextTrack,
        previousTrack,
        addToQueue,
        removeFromQueue,
        clearQueue,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};
