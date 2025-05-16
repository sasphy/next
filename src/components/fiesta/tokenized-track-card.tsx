import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { Play, TrendingUp, Users, Activity } from 'lucide-react';
import { Track, BondingCurveType } from '@/lib/types';
import { useSasphy } from '@/components/providers/sasphy-provider';
import { formatPrice, formatDuration } from '@/lib/utils';
import { 
  BondingCurveParams, 
  calculateBondingCurveProgress,
  calculateCurrentPrice
} from '@/lib/market-utils';
import BondingCurveChart from '@/components/ui/bonding-curve-chart';
// Local AudioWaveform component instead of importing
const AudioWaveform = ({ isPlaying, barCount = 5 }: { isPlaying: boolean, barCount?: number }) => (
  <div className="audio-waveform flex items-center gap-[3px]">
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

// Helper component for the progress bar
const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full bg-primary/10 rounded-full h-2 overflow-hidden">
    <motion.div 
      className="bg-primary h-full rounded-full"
      initial={{ width: 0 }}
      animate={{ width: `${Math.max(1, Math.min(100, progress))}%` }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    />
  </div>
);

// Component for token info badges
const TokenInfoBadge = ({ 
  icon, 
  label, 
  value 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number;
}) => (
  <div className="flex items-center gap-1.5 bg-card/30 backdrop-blur-sm px-2 py-1 rounded-md text-xs">
    {icon}
    <span className="text-muted-foreground">{label}:</span> 
    <span className="font-medium">{value}</span>
  </div>
);

interface TokenizedTrackCardProps {
  track: Track;
  index: number;
  showChart?: boolean;
}

const TokenizedTrackCard: React.FC<TokenizedTrackCardProps> = ({ 
  track, 
  index,
  showChart = false
}) => {
  const { playTrack, currentlyPlaying } = useSasphy();
  const isCurrentTrack = currentlyPlaying.track?.id === track.id;
  const isPlaying = isCurrentTrack && currentlyPlaying.isPlaying;
  
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });
  
  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playTrack(track);
  };
  
  // Generate mock bonding curve data if not available
  const bondingCurveParams: BondingCurveParams = {
    initialPrice: track.initialPrice || 0.1,
    delta: track.bondingCurve?.delta || 0.01,
    curveType: track.bondingCurve?.curveType || 'LINEAR',
    maxSupply: track.bondingCurve?.maxSupply || 1000
  };
  
  const currentSupply = track.totalSupply || 0;
  const progress = calculateBondingCurveProgress({
    currentSupply,
    maxSupply: bondingCurveParams.maxSupply
  });
  
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: showChart ? 1 : 1.02 }}
      className={`tokenized-track-card relative rounded-xl overflow-hidden 
        bg-gradient-to-b from-background to-card/50 
        border border-border/50 shadow-xl shadow-primary/5 
        ${showChart ? 'p-4' : ''}`}
    >
      <div className={`flex ${showChart ? 'flex-col md:flex-row gap-6' : 'flex-col'}`}>
        <div className={`${showChart ? 'md:w-1/3' : 'w-full'} relative`}>
          <div className={`track-image-container ${showChart ? 'aspect-square' : 'aspect-square'} relative overflow-hidden rounded-xl`}>
            <Image 
              src={track.coverImage} 
              alt={track.title} 
              width={400}
              height={400}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
            
            {/* Play button overlay */}
            <button 
              onClick={handlePlayClick}
              className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              <div className="bg-primary/90 text-primary-foreground rounded-full p-4 transform scale-90 hover:scale-100 transition-all shadow-xl">
                {isPlaying ? (
                  <div className="h-6 w-6 flex items-center justify-center">
                    <AudioWaveform isPlaying={true} />
                  </div>
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </div>
            </button>
          </div>
          
          <div className="track-content mt-3">
            <Link href={`/tracks/${track.id}`} className="hover:underline">
              <h3 className="text-base md:text-lg font-semibold truncate">{track.title}</h3>
            </Link>
            <p className="text-muted-foreground text-sm truncate">{track.artist}</p>
            
            <div className="mt-2 space-y-2">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{track.editionCount || 0}/{track.maxEditions || 100} minted</span>
                <span>{progress.toFixed(1)}% sold</span>
              </div>
              <ProgressBar progress={progress} />
              
              <div className="flex items-center justify-between mt-3">
                <span className="font-medium text-sm md:text-base">
                  {formatPrice(track.currentPrice || track.price)}
                </span>
                {track.duration && (
                  <span className="text-xs text-muted-foreground">
                    {formatDuration(track.duration)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {showChart && (
          <div className="md:w-2/3 flex flex-col">
            <div className="flex flex-wrap gap-2 mb-4">
              <TokenInfoBadge 
                icon={<Activity className="w-3 h-3" />}
                label="Curve"
                value={track.bondingCurve?.curveType || 'LINEAR'}
              />
              <TokenInfoBadge 
                icon={<Users className="w-3 h-3" />}
                label="Holders"
                value={track.holders || Math.min(track.editionCount || 0, 25 + Math.floor(Math.random() * 50))}
              />
              <TokenInfoBadge 
                icon={<TrendingUp className="w-3 h-3" />}
                label="Price Impact"
                value="+4.2%"
              />
            </div>
            
            <div className="flex-grow">
              <h4 className="text-sm font-medium mb-2">Price Curve</h4>
              <BondingCurveChart 
                params={bondingCurveParams}
                currentSupply={currentSupply}
                className="h-52 w-full"
              />
            </div>
          </div>
        )}
      </div>
      
      {!showChart && (
        <Link 
          href={`/tracks/${track.id}`}
          className="absolute bottom-0 left-0 right-0 py-2 bg-primary/10 text-primary text-center text-sm hover:bg-primary/20 transition-colors"
        >
          View Details
        </Link>
      )}
    </motion.div>
  );
};

export default TokenizedTrackCard; 