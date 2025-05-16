'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import WalletConnectButton from '@/components/wallet/wallet-connect-button';
import { useSolanaWallet } from '@/hooks/use-solana-wallet';
import { useMetaplex } from '@/hooks/use-metaplex';
import { Upload, Music, Image, Info, X, Disc, HelpCircle, Plus, Sparkles, AlertTriangle, Check, PlayCircle, Music2, HeartPulse, Timer, Award, Headphones, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Audio player component for preview
const AudioPreview = ({ file }: { file: File | null }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);
  
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  if (!audioUrl) return null;
  
  return (
    <div className="mt-4 bg-black/40 rounded-lg p-3 flex items-center gap-3">
      <button 
        onClick={togglePlay}
        className="w-10 h-10 flex-shrink-0 bg-purple-600 rounded-full flex items-center justify-center"
      >
        {isPlaying ? (
          <span className="h-4 w-4 bg-white rounded-sm" />
        ) : (
          <PlayCircle className="h-6 w-6 text-white" />
        )}
      </button>
      
      <div className="flex-grow">
        <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
            style={{ width: isPlaying ? '45%' : '0%', transition: 'width 0.3s linear' }}
          />
        </div>
      </div>
      
      <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
    </div>
  );
};

// Fee calculation component
const FeeCalculator = () => {
  return (
    <div className="bg-black/30 border border-purple-900/30 rounded-lg p-4">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-purple-400" />
        Transaction Details
      </h3>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">NFT Minting Fee</span>
          <span className="text-white">~0.012 SOL</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Storage Fee</span>
          <span className="text-white">~0.008 SOL</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Network Fee</span>
          <span className="text-white">~0.000005 SOL</span>
        </div>
        <div className="h-px bg-gray-800 my-2" />
        <div className="flex justify-between">
          <span className="text-gray-300 font-medium">Total</span>
          <span className="text-white font-semibold">~0.02 SOL</span>
        </div>
        </div>
      </div>
    </div>
  );
};

const CreateMusicNFTPage = () => {
  const router = useRouter();
  const { walletAddress, connected } = useSolanaWallet();
  const { createMusicNFT, isReady } = useMetaplex();
  
  // Form state
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [editions, setEditions] = useState(10);
  const [price, setPrice] = useState(0.1); // SOL
  const [royalty, setRoyalty] = useState(5); // 5%
  const [genres, setGenres] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'details' | 'preview'>('details');
  
  // Refs for file inputs
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle cover image selection
  const handleCoverImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate image file
    if (!file.type.includes('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    
    setCoverImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  // Handle audio file selection
  const handleAudioFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate audio file
    if (!file.type.includes('audio/')) {
      toast.error('Please select a valid audio file');
      return;
    }
    
    setAudioFile(file);
    toast.success(`Audio file "${file.name}" selected`);
  };
  
  // Toggle genre selection
  const toggleGenre = (genre: string) => {
    if (genres.includes(genre)) {
      setGenres(genres.filter(g => g !== genre));
    } else {
      setGenres([...genres, genre]);
    }
  };
  
  // Available genres
  const availableGenres = [
    'Electronic', 'Hip Hop', 'Pop', 'Rock', 'Jazz', 
    'Classical', 'R&B', 'Ambient', 'Lo-Fi', 'Trap',
    'House', 'Techno', 'Indie', 'Folk', 'Experimental'
  ];
  
  // Preview the track before minting
  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!title || !artist || !symbol || !description || !coverImage || !audioFile) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setStep('preview');
  };
  
  // Back to editing
  const backToEditing = () => {
    setStep('details');
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!isReady) {
      toast.error('Metaplex service is not ready');
      return;
    }
    
    if (!title || !artist || !symbol || !description || !coverImage || !audioFile) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create NFT metadata
      const metadata = {
        name: title,
        symbol: symbol.toUpperCase().substring(0, 10),
        description,
        image: coverImage,
        audioFile,
        sellerFeeBasisPoints: royalty * 100, // Convert percentage to basis points
        attributes: [
          {
            trait_type: 'Artist',
            value: artist
          },
          {
            trait_type: 'Type',
            value: 'Music'
          },
          {
            trait_type: 'Price',
            value: price
          },
          ...genres.map(genre => ({
            trait_type: 'Genre',
            value: genre
          }))
        ],
        creators: [
          {
            address: walletAddress,
            share: 100
          }
        ]
      };
      
      // Create NFT
      const nft = await createMusicNFT(metadata, editions);
      
      if (nft) {
        toast.success('Music NFT created successfully!');
        // Reset form
        setTitle('');
        setArtist('');
        setSymbol('');
        setDescription('');
        setCoverImage(null);
        setCoverImagePreview(null);
        setAudioFile(null);
      }
    } catch (error) {
      console.error('Error creating NFT:', error);
      toast.error('Failed to create Music NFT');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900/10 to-black/20">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="bg-gradient-to-b from-gray-900 to-black border border-purple-900/30 rounded-xl backdrop-blur-lg p-6 md:p-8 shadow-xl shadow-purple-900/10">
          <div className="flex items-center justify-between mb-6">
            <Link href="/discover" className="text-white hover:text-purple-300 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
              {step === 'details' ? 'Create Music NFT' : 'Preview & Mint'}
            </h1>
            <div className="w-5" />
          </div>
        
          {!connected ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="mb-6 text-center">
                <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Music size={32} className="text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Connect your wallet to get started</h2>
                <p className="text-gray-400 mb-6">You need to connect your Solana wallet first to create a music NFT</p>
              </div>
              <WalletConnectButton />
            </div>
          ) : step === 'details' ? (
            <form onSubmit={handlePreview}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Cover Image Upload */}
                <div className="md:col-span-1 order-1">
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Cover Image <span className="text-red-400">*</span>
                  </label>
                  <div 
                    className={`border-2 border-dashed rounded-xl overflow-hidden aspect-square flex flex-col items-center justify-center cursor-pointer relative ${
                      coverImagePreview ? 'border-transparent' : 'border-purple-600/40 hover:border-purple-500/70'
                    }`}
                    onClick={() => coverImageInputRef.current?.click()}
                  >
                    {coverImagePreview ? (
                      <div className="w-full h-full relative group">
                        <img 
                          src={coverImagePreview} 
                          alt="Cover preview" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            type="button"
                            className="bg-red-600 rounded-full p-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCoverImage(null);
                              setCoverImagePreview(null);
                            }}
                          >
                            <X className="h-5 w-5 text-white" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-6">
                        <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Image size={24} className="text-purple-400" />
                        </div>
                        <h3 className="text-white font-medium mb-1">Upload Cover Art</h3>
                        <p className="text-gray-400 text-sm">JPG, PNG or GIF, 1:1 ratio recommended</p>
                      </div>
                    )}
                    
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={coverImageInputRef}
                      onChange={handleCoverImageChange}
                    />
                  </div>
                </div>
              
                {/* Form Fields */}
                <div className="md:col-span-1 order-2 flex flex-col space-y-5">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-purple-300 mb-2">
                      Track Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Solana Sunset"
                      required
                      className="w-full bg-black/30 border border-purple-900/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="artist" className="block text-sm font-medium text-purple-300 mb-2">
                      Artist Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="artist"
                      type="text"
                      value={artist}
                      onChange={(e) => setArtist(e.target.value)}
                      placeholder="e.g. CryptoBeats"
                      required
                      className="w-full bg-black/30 border border-purple-900/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="symbol" className="block text-sm font-medium text-purple-300 mb-2">
                        Token Symbol <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="symbol"
                        type="text"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10))}
                        placeholder="e.g. BEAT"
                        required
                        className="w-full bg-black/30 border border-purple-900/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        maxLength={10}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-purple-300 mb-2">
                        Price (SOL) <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="price"
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(parseFloat(e.target.value))}
                        step="0.01"
                        min="0"
                        required
                        className="w-full bg-black/30 border border-purple-900/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="editions" className="block text-sm font-medium text-purple-300 mb-2">
                        Editions <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="editions"
                        type="number"
                        value={editions}
                        onChange={(e) => setEditions(parseInt(e.target.value))}
                        min={1}
                        max={1000}
                        required
                        className="w-full bg-black/30 border border-purple-900/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="royalty" className="block text-sm font-medium text-purple-300 mb-2">
                        Royalty % <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="royalty"
                        type="number"
                        value={royalty}
                        onChange={(e) => setRoyalty(parseInt(e.target.value))}
                        min={0}
                        max={50}
                        required
                        className="w-full bg-black/30 border border-purple-900/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-purple-300 mb-2">
                      Description <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your track..."
                      rows={3}
                      required
                      className="w-full bg-black/30 border border-purple-900/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      Audio File <span className="text-red-400">*</span>
                    </label>
                    <button
                      type="button"
                      className={`w-full border border-purple-900/50 rounded-lg px-4 py-3 flex items-center justify-center gap-2 ${
                        audioFile ? 'bg-purple-900/30 text-white' : 'bg-black/30 text-purple-400 hover:bg-purple-900/20'
                      }`}
                      onClick={() => audioFileInputRef.current?.click()}
                    >
                      <Music2 size={20} />
                      {audioFile ? `Selected: ${audioFile.name}` : 'Click to upload MP3, WAV, or FLAC'}
                    </button>
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      ref={audioFileInputRef}
                      onChange={handleAudioFileChange}
                      required
                    />
                  </div>
                  
                  {audioFile && <AudioPreview file={audioFile} />}
                  
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      Genres <span className="text-gray-500 font-normal">(Optional)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableGenres.map(genre => (
                        <button
                          key={genre}
                          type="button"
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            genres.includes(genre)
                              ? 'bg-purple-600 text-white'
                              : 'bg-black/30 border border-purple-900/30 text-gray-300 hover:bg-purple-900/20'
                          }`}
                          onClick={() => toggleGenre(genre)}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              
                {/* Submit Section */}
                <div className="md:col-span-2 order-3 border-t border-gray-800 pt-6 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-purple-900/10 border border-purple-700/30 rounded-lg p-4 flex items-start gap-3">
                      <AlertTriangle className="text-purple-400 mt-0.5 flex-shrink-0" size={18} />
                      <div className="text-sm text-purple-300">
                        <p className="font-medium mb-1">Important information</p>
                        <p>Minting NFTs requires small transaction fees paid in SOL. Make sure you have enough SOL in your wallet to cover gas fees.</p>
                      </div>
                    </div>
                    
                    <FeeCalculator />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                    disabled={!coverImage || !audioFile}
                  >
                    <Sparkles size={20} />
                    Continue to Preview
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-8">
              {/* Preview Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column - Image & Audio Preview */}
                <div>
                  <div className="rounded-xl overflow-hidden mb-4">
                    {coverImagePreview && (
                      <img 
                        src={coverImagePreview} 
                        alt={title} 
                        className="w-full aspect-square object-cover"
                      />
                    )}
                  </div>
                  
                  {audioFile && <AudioPreview file={audioFile} />}
                </div>
                
                {/* Right Column - Track Details */}
                <div className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{title}</h2>
                    <p className="text-purple-300">{artist}</p>
                  </div>
                  
                  <div className="flex gap-3 flex-wrap">
                    {genres.map(genre => (
                      <span key={genre} className="bg-purple-900/40 text-purple-200 py-1 px-3 rounded-full text-sm">
                        {genre}
                      </span>
                    ))}
                  </div>
                  
                  <p className="text-gray-400">{description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/40 rounded-lg p-3 flex flex-col items-center">
                      <div className="mb-1 text-gray-400 text-xs">PRICE</div>
                      <div className="text-white font-semibold flex items-center gap-1">
                        {price} SOL
                      </div>
                    </div>
                    
                    <div className="bg-black/40 rounded-lg p-3 flex flex-col items-center">
                      <div className="mb-1 text-gray-400 text-xs">EDITIONS</div>
                      <div className="text-white font-semibold">{editions}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/40 rounded-lg p-3 flex flex-col items-center">
                      <div className="mb-1 text-gray-400 text-xs">ROYALTY</div>
                      <div className="text-white font-semibold">{royalty}%</div>
                    </div>
                    
                    <div className="bg-black/40 rounded-lg p-3 flex flex-col items-center">
                      <div className="mb-1 text-gray-400 text-xs">SYMBOL</div>
                      <div className="text-white font-semibold">{symbol}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-800">
                <Button
                  type="button"
                  onClick={backToEditing}
                  className="w-full bg-black/40 border border-purple-900/30 text-white py-3 rounded-lg font-medium"
                >
                  Back to Editing
                </Button>
                
                <Button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-white" />
                      Minting NFT...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      Mint Music NFT
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default CreateMusicNFTPage;
