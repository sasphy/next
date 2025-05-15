'use client';

import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@radix-ui/react-slider';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';

interface WaveformPlayerProps {
  audioUrl: string;
  title: string;
  artist: string;
  coverArt?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  waveColor?: string;
  progressColor?: string;
}

const WaveformPlayer = ({
  audioUrl,
  title,
  artist,
  coverArt,
  autoPlay = false,
  onEnded,
  waveColor = 'rgba(153, 69, 255, 0.4)',
  progressColor = 'rgba(153, 69, 255, 0.9)',
}: WaveformPlayerProps) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  // Initialize wavesurfer
  useEffect(() => {
    if (!waveformRef.current) return;
    
    // Destroy old instance
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }
    
    // Create wavesurfer instance
    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: waveColor,
      progressColor: progressColor,
      cursorColor: 'transparent',
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      height: 60,
      normalize: true,
    });
    
    wavesurferRef.current = wavesurfer;
    
    // Load audio
    wavesurfer.load(audioUrl);
    
    // Event listeners
    wavesurfer.on('ready', () => {
      setDuration(wavesurfer.getDuration());
      setIsReady(true);
      wavesurfer.setVolume(volume);
      
      if (autoPlay) {
        wavesurfer.play();
        setIsPlaying(true);
      }
    });
    
    wavesurfer.on('audioprocess', () => {
      setCurrentTime(wavesurfer.getCurrentTime());
    });
    
    wavesurfer.on('seek', () => {
      setCurrentTime(wavesurfer.getCurrentTime());
    });
    
    wavesurfer.on('finish', () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
    });
    
    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, [audioUrl, autoPlay, onEnded, progressColor, volume, waveColor]);
  
  // Handle play/pause
  const togglePlayPause = () => {
    if (!wavesurferRef.current || !isReady) return;
    
    if (isPlaying) {
      wavesurferRef.current.pause();
    } else {
      wavesurferRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    if (!wavesurferRef.current) return;
    
    wavesurferRef.current.setVolume(newVolume);
    setVolume(newVolume);
    
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };
  
  // Handle mute toggle
  const toggleMute = () => {
    if (!wavesurferRef.current) return;
    
    if (isMuted) {
      wavesurferRef.current.setVolume(volume || 0.8);
      setIsMuted(false);
    } else {
      wavesurferRef.current.setVolume(0);
      setIsMuted(true);
    }
  };
  
  // Format time (seconds -> mm:ss)
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="w-full bg-gray-900 bg-opacity-60 backdrop-blur-md rounded-lg p-4 shadow-lg">
      <div className="flex items-center gap-4 mb-4">
        {coverArt && (
          <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
            <img 
              src={coverArt} 
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white truncate">{title}</h3>
          <p className="text-purple-300 truncate">{artist}</p>
        </div>
      </div>
      
      <div className="mb-4" ref={waveformRef}></div>
      
      <div className="flex items-center justify-between">
        <div className="text-gray-300 text-sm">
          {formatTime(currentTime)}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-full text-white hover:bg-purple-800 hover:text-white"
            onClick={() => {
              if (!wavesurferRef.current) return;
              wavesurferRef.current.skip(-10);
            }}
          >
            <SkipBack size={18} />
          </Button>
          
          <Button
            size="icon"
            className="h-10 w-10 rounded-full bg-purple-600 text-white hover:bg-purple-700"
            onClick={togglePlayPause}
            disabled={!isReady}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </Button>
          
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-full text-white hover:bg-purple-800 hover:text-white"
            onClick={() => {
              if (!wavesurferRef.current) return;
              wavesurferRef.current.skip(10);
            }}
          >
            <SkipForward size={18} />
          </Button>
        </div>
        
        <div className="flex items-center gap-2 w-24">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-gray-300 hover:text-white"
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </Button>
          
          <Slider
            defaultValue={[volume * 100]}
            value={[isMuted ? 0 : volume * 100]}
            max={100}
            step={1}
            onValueChange={([newVolume]) => handleVolumeChange(newVolume / 100)}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default WaveformPlayer;
