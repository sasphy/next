"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AudioSpectrumProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  className?: string;
  barCount?: number;
  barColor?: string;
  height?: number;
  rounded?: boolean;
}

/**
 * Audio spectrum visualization component for the music player
 */
const AudioSpectrum: React.FC<AudioSpectrumProps> = ({
  audioRef,
  isPlaying,
  className,
  barCount = 70,
  barColor = "var(--color-primary)",
  height = 60,
  rounded = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number>(0);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  
  // Initialize audio context and analyzer
  useEffect(() => {
    if (!audioRef.current) return;
    
    // Create audio context only when needed (to avoid autoplay restrictions)
    if (!audioContext) {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(context);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioRef, audioContext]);
  
  // Connect audio element to analyzer when audio context is ready
  useEffect(() => {
    if (!audioRef.current || !audioContext) return;
    
    if (!analyserRef.current) {
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      
      if (!sourceRef.current) {
        const source = audioContext.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        sourceRef.current = source;
      }
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
    }
    
  }, [audioRef, audioContext]);
  
  // Draw spectrum when playing state changes
  useEffect(() => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return;
    
    // Resume audio context if it's suspended (autoplay policy)
    if (audioContext?.state === 'suspended') {
      audioContext.resume();
    }
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const draw = () => {
      if (!ctx || !analyserRef.current || !dataArrayRef.current) return;
      
      // Stop animation if not playing
      if (!isPlaying) {
        // Draw empty bars with low opacity when paused
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / barCount) * 0.8;
        const barSpacing = (canvas.width / barCount) * 0.2;
        
        for (let i = 0; i < barCount; i++) {
          const x = i * (barWidth + barSpacing);
          const barHeight = Math.random() * 5 + 1; // Very small random height for idle state
          
          ctx.fillStyle = barColor + '40'; // Lower opacity
          
          if (rounded) {
            // Draw rounded top for bars
            const radius = barWidth / 2;
            
            ctx.beginPath();
            ctx.moveTo(x, canvas.height);
            ctx.lineTo(x, canvas.height - barHeight + radius);
            ctx.quadraticCurveTo(x, canvas.height - barHeight, x + radius, canvas.height - barHeight);
            ctx.lineTo(x + barWidth - radius, canvas.height - barHeight);
            ctx.quadraticCurveTo(x + barWidth, canvas.height - barHeight, x + barWidth, canvas.height - barHeight + radius);
            ctx.lineTo(x + barWidth, canvas.height);
            ctx.fill();
          } else {
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          }
        }
        
        return;
      }
      
      animationFrameRef.current = requestAnimationFrame(draw);
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / barCount) * 0.8;
      const barSpacing = (canvas.width / barCount) * 0.2;
      
      for (let i = 0; i < barCount; i++) {
        // Get data for this bar (use every nth item from the frequency data)
        const dataIndex = Math.floor(i * analyserRef.current.frequencyBinCount / barCount);
        const value = dataArrayRef.current[dataIndex];
        
        // Scale the value to fit the canvas height
        const barHeight = (value / 255.0) * canvas.height * 0.9;
        const x = i * (barWidth + barSpacing);
        
        // Apply a gradient effect based on height
        const hue = 290 - (barHeight / canvas.height) * 30; // Slight hue shift
        ctx.fillStyle = barColor;
        
        if (rounded) {
          // Draw rounded top for bars
          const radius = barWidth / 2;
          
          ctx.beginPath();
          ctx.moveTo(x, canvas.height);
          ctx.lineTo(x, canvas.height - barHeight + radius);
          ctx.quadraticCurveTo(x, canvas.height - barHeight, x + radius, canvas.height - barHeight);
          ctx.lineTo(x + barWidth - radius, canvas.height - barHeight);
          ctx.quadraticCurveTo(x + barWidth, canvas.height - barHeight, x + barWidth, canvas.height - barHeight + radius);
          ctx.lineTo(x + barWidth, canvas.height);
          ctx.fill();
        } else {
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        }
      }
    };
    
    draw();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, barCount, barColor, rounded, audioContext]);
  
  return (
    <div className={cn("w-full relative motion-opacity-in-[0] motion-duration-[0.5s]", className)}>
      <canvas
        ref={canvasRef}
        width={500}
        height={height}
        className="w-full h-auto"
      />
    </div>
  );
};

export default AudioSpectrum; 