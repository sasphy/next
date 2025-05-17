'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

// Types for token data
type BondingCurveType = 'Linear' | 'Exponential' | 'Logarithmic' | 'Sigmoid';

// Demo token data
const demoTokens = {
  'mock-token-1': {
    name: 'Summer Vibes',
    symbol: 'VIBE',
    artistName: 'Solana Beats',
    artistAddress: '7vCWanYCd848kSEqEbZUuamhgFhnKqDh4b2TC1fVEGg9',
    coverArt: 'https://source.unsplash.com/random/300x300?music',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    description: 'A relaxing summer track with tropical influences and upbeat percussion',
    mint: '8s5YBCKSHpjVmqfnF6xT3mHMQZGZt5k7QNQWUVtiJ1Vn',
    currentSupply: 142,
    totalSupply: null, // null means unlimited
    initialPrice: 10000000, // 0.01 SOL in lamports
    currentPrice: 25000000, // 0.025 SOL in lamports
    delta: 1000000, // 0.001 SOL in lamports
    curveType: 'Exponential' as BondingCurveType,
    artistFee: 500, // 5%
    platformFee: 100, // 1%
    isActive: true,
    createdAt: '2023-06-15T14:23:45Z',
    tags: ['Electronic', 'Summer', 'Tropical']
  },
  'mock-token-2': {
    name: 'Night Drive',
    symbol: 'DRIVE',
    artistName: 'Crypto Waves',
    artistAddress: '9xQFVdZ1arfDJ1TBk5PKQbVwr9MeGXvqaD7LsiPGHxeL',
    coverArt: 'https://source.unsplash.com/random/300x300?night',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    description: 'A synthwave track inspired by late night drives through neon-lit streets',
    mint: '4rJU1uayu4ZG7bXvDTxT139XyZ9e5zzWMkzJLPE3nMN3',
    currentSupply: 89,
    totalSupply: null,
    initialPrice: 15000000, // 0.015 SOL in lamports
    currentPrice: 30000000, // 0.03 SOL in lamports
    delta: 1500000, // 0.0015 SOL in lamports
    curveType: 'Linear' as BondingCurveType,
    artistFee: 750, // 7.5%
    platformFee: 100, // 1%
    isActive: true,
    createdAt: '2023-07-02T09:12:33Z',
    tags: ['Synthwave', 'Electronic', 'Night']
  },
  'mock-token-3': {
    name: 'Blockchain Beats',
    symbol: 'BLOCK',
    artistName: 'Crypto DJ',
    artistAddress: '3yGnrvLDrMobD1PyJnnTa2paD9PrafZQf1NLNGdNYobW',
    coverArt: 'https://source.unsplash.com/random/300x300?technology',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    description: 'An experimental EDM track with sounds inspired by blockchain technology',
    mint: 'Fw4VQ6NpDDKZKmQxjNLyz9LJMhpf6hMrfpCaAKVArnc4',
    currentSupply: 215,
    totalSupply: null,
    initialPrice: 20000000, // 0.02 SOL in lamports
    currentPrice: 45000000, // 0.045 SOL in lamports
    delta: 2000000, // 0.002 SOL in lamports
    curveType: 'Sigmoid' as BondingCurveType,
    artistFee: 600, // 6%
    platformFee: 100, // 1%
    isActive: true,
    createdAt: '2023-08-10T18:45:21Z',
    tags: ['EDM', 'Experimental', 'Tech']
  }
};

// Generate a template token for any ID
function generateTokenTemplate(tokenId: string) {
  // Create an index based on a hash of the token ID string to ensure consistent data
  const hashCode = (s: string) => s.split('').reduce((a, b) => (((a << 5) - a) + b.charCodeAt(0))|0, 0);
  const index = Math.abs(hashCode(tokenId)) % 10; // Use modulo 10 to get a number from 0-9
  
  // Different cover art and audio for variety
  const coverIndex = (index % 10) + 1;
  const audioIndex = ((index + 3) % 10) + 1;
  
  // Choose names and descriptions based on index
  const names = [
    'Digital Echo', 'Quantum Beat', 'Neon Dreams', 'Crypto Horizon', 'Blockchain Pulse',
    'Metaverse Melody', 'Token Harmony', 'Solana Sunset', 'Web3 Rhapsody', 'Genesis Groove'
  ];
  
  const descriptions = [
    'An electronic anthem with dreamy synths and powerful drops.',
    'A future bass track with innovative sound design and catchy hooks.',
    'A melodic journey through soundscapes inspired by digital architecture.',
    'A high-energy EDM track with memorable hooks and captivating rhythms.',
    'A chill downtempo piece with atmospheric pads and gentle percussion.',
    'A progressive track that builds slowly to an epic climax.',
    'A dance floor filler with infectious grooves and tight production.',
    'An experimental piece fusing traditional instruments with digital processing.',
    'A lofi track perfect for studying or relaxing with smooth beats.',
    'A tropical house track with summer vibes and uplifting melodies.'
  ];
  
  const artistNames = [
    'Quantum Collective', 'Digital Dreamers', 'Crypto Wave', 'Blockchain Beats',
    'Token Force', 'Metaverse Mavericks', 'Web3 Wizards', 'Solana Sound',
    'Genesis Group', 'Neon Network'
  ];
  
  const symbols = [
    'ECHO', 'QNTM', 'NEON', 'CRPT', 'BLCK',
    'META', 'TOKN', 'SOL', 'WEB3', 'GEN'
  ];
  
  const tags = [
    ['Electronic', 'Dance', 'EDM'],
    ['Future Bass', 'Synth', 'Digital'],
    ['Ambient', 'Chill', 'Melodic'],
    ['House', 'Progressive', 'Tech'],
    ['Lo-fi', 'Relax', 'Beats'],
    ['Trap', 'Bass', 'Urban'],
    ['Techno', 'Club', 'Night'],
    ['Experimental', 'Abstract', 'Modern'],
    ['Tropical', 'Summer', 'Upbeat'],
    ['Fusion', 'World', 'Hybrid']
  ];
  
  const curveTypes: BondingCurveType[] = ['Linear', 'Exponential', 'Logarithmic', 'Sigmoid'];
  
  return {
    name: names[index],
    symbol: symbols[index],
    artistName: artistNames[index],
    artistAddress: tokenId.substring(0, 32), // Use part of the token ID as the artist address
    coverArt: `/assets/album-covers/cover-${coverIndex}.jpg`,
    audioUrl: `/assets/audio-${audioIndex}.mp3`,
    description: descriptions[index],
    mint: tokenId,
    currentSupply: 100 + (index * 25),
    totalSupply: null,
    initialPrice: (10000000 + (index * 1000000)), // 0.01 SOL + variance
    currentPrice: (25000000 + (index * 2000000)), // 0.025 SOL + variance
    delta: 1000000 + (index * 100000),
    curveType: curveTypes[index % curveTypes.length],
    artistFee: 500 + (index * 50), // 5% + variance
    platformFee: 100, // 1% fixed
    isActive: true,
    createdAt: new Date(Date.now() - (index * 86400000)).toISOString(), // Staggered dates
    tags: tags[index]
  };
}

// Helper function to describe bonding curve
function describeBondingCurve(type: BondingCurveType): string {
  switch (type) {
    case 'Linear':
      return "Linear - Price increases steadily as more tokens are bought";
    case 'Exponential':
      return "Exponential - Price increases faster as more tokens are bought";
    case 'Logarithmic':
      return "Logarithmic - Price increases quickly at first, then more slowly";
    case 'Sigmoid':
      return "Sigmoid - S-curve pricing with slow start, quick middle growth, then plateau";
    default:
      return "Unknown curve type";
  }
}

// Helper to format SOL amount
function formatSol(lamports: number): string {
  return `${(lamports / LAMPORTS_PER_SOL).toFixed(9)} SOL`;
}

// Format percentage
function formatPercentage(basisPoints: number): string {
  return `${(basisPoints / 100).toFixed(2)}%`;
}

// Main token detail page component
export default function TokenDetailPage() {
  const params = useParams();
  const tokenId = params?.tokenId as string;
  
  const [token, setToken] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(1);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  
  // Fetch token info
  useEffect(() => {
    const fetchToken = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // In a real app, this would be an API call
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (tokenId in demoTokens) {
          // Use predefined token if available
          setToken(demoTokens[tokenId as keyof typeof demoTokens]);
        } else if (tokenId && tokenId.length > 0) {
          // Generate a token based on the ID if it's not in our demo list
          setToken(generateTokenTemplate(tokenId));
        } else {
          setError("Token not found");
        }
      } catch (err) {
        console.error("Error fetching token:", err);
        setError("Failed to load token information");
      } finally {
        setLoading(false);
      }
    };
    
    fetchToken();
    
    // Clean up audio on unmount
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = "";
      }
    };
  }, [tokenId]);
  
  // Initialize audio player
  useEffect(() => {
    if (token?.audioUrl && !audioElement) {
      const audio = new Audio(token.audioUrl);
      audio.loop = true;
      setAudioElement(audio);
    }
  }, [token, audioElement]);
  
  // Handle play/pause
  const toggleAudio = () => {
    if (!audioElement) return;
    
    if (audioPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    
    setAudioPlaying(!audioPlaying);
  };
  
  // Simulate token purchase
  const buyTokens = async () => {
    if (!token || amount <= 0) return;
    
    setPurchaseLoading(true);
    
    try {
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update token supply and price (simulate bonding curve effect)
      let newPrice = token.currentPrice;
      if (token.curveType === 'Linear') {
        newPrice = token.currentPrice + (token.delta * amount);
      } else if (token.curveType === 'Exponential') {
        newPrice = token.currentPrice + (token.delta * amount * amount);
      }
      
      setToken({
        ...token,
        currentSupply: token.currentSupply + amount,
        currentPrice: newPrice
      });
      
      // Show success notification (would be handled by a toast in production)
      alert(`Successfully purchased ${amount} ${token.symbol} tokens!`);
    } catch (err) {
      console.error("Error buying tokens:", err);
      alert("Failed to purchase tokens. Please try again.");
    } finally {
      setPurchaseLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-8 max-w-6xl">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-xl">Loading token information...</div>
        </div>
      </div>
    );
  }
  
  if (error || !token) {
    return (
      <div className="container mx-auto p-8 max-w-6xl">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
                     <h1 className="text-4xl font-bold mb-4">Token Not Found</h1>
           <p className="text-muted-foreground mb-8">The token you're looking for doesn't exist or has been removed.</p>
           <Button asChild>
             <Link href="/">Back to Home</Link>
           </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Token info */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{token.name}</h1>
          <div className="flex items-center gap-2 mb-6">
            <div className="text-xl text-muted-foreground">{token.symbol}</div>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <div className="bg-primary/20 w-full h-full flex items-center justify-center text-xs">
                  {token.artistName[0]}
                </div>
              </Avatar>
              <span className="text-sm">{token.artistName}</span>
            </div>
          </div>
          
          <div className="relative aspect-square max-w-md mb-6 rounded-xl overflow-hidden">
            <img 
              src={token.coverArt} 
              alt={token.name} 
              className="w-full h-full object-cover"
            />
            <Button 
              onClick={toggleAudio}
              variant="outline" 
              size="icon" 
              className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-background/90"
            >
              {audioPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pause">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              )}
            </Button>
          </div>
          
          <p className="text-base mb-6">{token.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-8">
            {token.tags.map((tag: string) => (
              <span key={tag} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
          
          <Tabs defaultValue="market">
            <TabsList className="mb-4">
              <TabsTrigger value="market">Market Info</TabsTrigger>
              <TabsTrigger value="details">Token Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="market">
              <Card>
                <CardHeader>
                  <CardTitle>Market Information</CardTitle>
                  <CardDescription>
                    Bonding curve details and token economics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Current Supply</h3>
                      <p className="text-xl font-semibold">{token.currentSupply} tokens</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Current Price</h3>
                      <p className="text-xl font-semibold">{formatSol(token.currentPrice)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Initial Price</h3>
                      <p className="text-lg">{formatSol(token.initialPrice)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Curve Type</h3>
                      <p className="text-lg">{token.curveType}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Artist Fee</h3>
                      <p className="text-lg">{formatPercentage(token.artistFee)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Platform Fee</h3>
                      <p className="text-lg">{formatPercentage(token.platformFee)}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-muted-foreground">
                    {describeBondingCurve(token.curveType as BondingCurveType)}
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Technical Details</CardTitle>
                  <CardDescription>
                    On-chain information for this token
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Mint Address</h3>
                    <p className="text-sm font-mono bg-gray-100 p-2 rounded overflow-x-auto">{token.mint}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Artist Address</h3>
                    <p className="text-sm font-mono bg-gray-100 p-2 rounded overflow-x-auto">{token.artistAddress}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                    <p className="text-sm">{new Date(token.createdAt).toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right column - Buy widget */}
        <div>
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Buy {token.symbol} Tokens</CardTitle>
              <CardDescription>
                Tokens follow a bonding curve price model
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Current Price</h3>
                  <p className="text-2xl font-bold">{formatSol(token.currentPrice)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Quantity</h3>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setAmount(Math.max(1, amount - 1))}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-minus"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </Button>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center border rounded p-2"
                      min="1"
                      aria-label="Token quantity"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setAmount(amount + 1)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Cost</h3>
                  <p className="text-xl font-semibold">
                    {formatSol(token.currentPrice * amount)}
                  </p>
                </div>
                
                <Button 
                  className="w-full"
                  onClick={buyTokens}
                  disabled={purchaseLoading}
                >
                  {purchaseLoading ? 'Processing...' : `Buy ${amount} Token${amount !== 1 ? 's' : ''}`}
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  By purchasing, you agree to the terms of service and acknowledge that token prices may fluctuate based on the bonding curve.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 