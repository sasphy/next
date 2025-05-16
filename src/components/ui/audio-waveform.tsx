import React from 'react';
import { motion } from 'framer-motion';

interface AudioWaveformProps {
  isPlaying: boolean;
  barCount?: number;
  className?: string;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ 
  isPlaying, 
  barCount = 5,
  className = ''
}) => (
  <div className={`audio-waveform flex items-center gap-[3px] ${className}`}>
    {Array.from({ length: barCount }).map((_, i) => (
      <motion.div
        key={i}
        className="bg-primary rounded-full w-1"
        initial={{ height: 4 }}
        animate={{
          height: isPlaying ? [8, 16, 24, 16, 8] : 4
        }}
        transition={{
          duration: 1.2,
          repeat: isPlaying ? Infinity : 0,
          delay: i * 0.1,
          ease: "easeInOut"
        }}
      />
    ))}
  </div>
);

export default AudioWaveform; 