'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Heart, Share2, ExternalLink } from 'lucide-react';
import { useSolanaWallet } from '@/hooks/use-solana-wallet';
import { toast } from 'sonner';

interface MusicNFTCardProps {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  audioPreviewUrl: string;
  price: number;
  available: number;
  likes: number;
  mintAddress?: string;
  onPlay: (id: string) => void;
  isPlaying: boolean;
  onPurchase: (id: string) => Promise<void>;
}

const MusicNFTCard = ({
  id,
  title,
  artist,
  imageUrl,
  audioPreviewUrl,
  price,
  available,
  likes,
  mintAddress,
  onPlay,
  isPlaying,
  onPurchase,
}: MusicNFTCardProps) => {
  const { walletAddress } = useSolanaWallet();
  const [isLiked, setIsLiked] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  const handlePlayClick = () => {
    onPlay(id);
  };

  const handleLikeClick = () => {
    if (!walletAddress) {
      toast.error('Please connect your wallet to like this track');
      return;
    }
    
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    
    // In a real implementation, we'd call an API to record the like
    toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleShareClick = () => {
    if (navigator.share) {
      navigator.share({
        title: `${title} by ${artist}`,
        text: `Check out "${title}" by ${artist} on Sasphy`,
        url: `https://sasphy.app/track/${id}`,
      }).catch(err => {
        console.error('Error sharing:', err);
        // Fallback to clipboard
        copyToClipboard();
      });
    } else {
      // Fallback to clipboard
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`https://sasphy.app/track/${id}`)
      .then(() => {
        toast.success('Link copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        toast.error('Failed to copy link');
      });
  };

  const handlePurchase = async () => {
    if (!walletAddress) {
      toast.error('Please connect your wallet to purchase this track');
      return;
    }
    
    setIsPurchasing(true);
    try {
      await onPurchase(id);
      toast.success('Purchase successful');
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Purchase failed');
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="relative group overflow-hidden rounded-xl bg-gradient-to-b from-purple-900/30 to-black/80 border border-purple-900/20 hover:border-purple-500/30 transition-all duration-300 w-full max-w-xs">
      {/* Cover Art with Play Button */}
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button
            onClick={handlePlayClick}
            className="w-12 h-12 rounded-full bg-purple-600 text-white hover:bg-purple-700 hover:scale-110 transition-all duration-300"
          >
            {isPlaying ? <Pause /> : <Play className="ml-0.5" />}
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-white line-clamp-1">{title}</h3>
            <p className="text-sm text-purple-300">{artist}</p>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-full ${isLiked ? 'text-purple-500' : 'text-gray-400'} hover:text-purple-500 hover:bg-purple-500/10`}
              onClick={handleLikeClick}
            >
              <Heart className={isLiked ? 'fill-current' : ''} size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-gray-400 hover:text-purple-500 hover:bg-purple-500/10"
              onClick={handleShareClick}
            >
              <Share2 size={18} />
            </Button>
          </div>
        </div>
        
        {/* Stats and Price */}
        <div className="flex justify-between items-center text-sm mt-3">
          <div className="flex flex-col">
            <span className="text-gray-400">Available</span>
            <span className="font-medium text-white">{available} copies</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-gray-400">Price</span>
            <span className="font-medium text-white">{price} SOL</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          <Button
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            onClick={handlePurchase}
            disabled={isPurchasing || available === 0}
          >
            {isPurchasing ? 'Processing...' : available === 0 ? 'Sold Out' : 'Purchase'}
          </Button>
          
          {mintAddress && (
            <Button
              variant="outline"
              className="w-10 border-purple-700 text-purple-500 hover:bg-purple-900/30"
              onClick={() => window.open(`https://solscan.io/token/${mintAddress}`, '_blank')}
            >
              <ExternalLink size={16} />
            </Button>
          )}
        </div>
      </div>
      
      {/* Popularity badge */}
      {likeCount > 50 && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
          Popular
        </div>
      )}
    </div>
  );
};

export default MusicNFTCard;
