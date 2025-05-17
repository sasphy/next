'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { createNoise2D } from 'simplex-noise';

export default function WaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    // Generate a simplex noise instance
    const noise2D = createNoise2D();
    
    // Animation variables
    let animationId: number;
    let time = 0;
    
    // Draw wave pattern
    const drawWaves = () => {
      if (!ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set wave properties
      const waveCount = 3;
      const colors = [
        'rgba(153, 69, 255, 0.3)',  // Purple (Solana)
        'rgba(20, 241, 149, 0.2)',  // Green (Solana)
        'rgba(153, 69, 255, 0.15)'  // Purple (lighter)
      ];
      
      // Draw each wave
      for (let i = 0; i < waveCount; i++) {
        const frequency = 0.003 - (i * 0.001);
        const amplitude = 100 + (i * 50);
        const speed = 0.0002 + (i * 0.0001);
        
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        
        // Draw a smooth wave path
        for (let x = 0; x < canvas.width; x += 5) {
          const y = canvas.height / 2 + 
                   amplitude * noise2D(x * frequency, time * speed) +
                   amplitude / 2 * noise2D(x * frequency * 2, time * speed * 1.5);
          
          ctx.lineTo(x, y);
        }
        
        // Complete the wave path
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        
        // Fill wave
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
      }
      
      // Update time for animation
      time += 1;
      
      // Continue animation loop
      animationId = requestAnimationFrame(drawWaves);
    };
    
    // Start animation
    drawWaves();
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  return (
    <motion.canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    />
  );
}
