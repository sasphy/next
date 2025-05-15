'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import WalletConnectButton from '@/components/wallet/wallet-connect-button';
import { useSolanaWallet } from '@/hooks/use-solana-wallet';
import { useMetaplex } from '@/hooks/use-metaplex';
import { Upload, Music, Image, Info } from 'lucide-react';
import { toast } from 'sonner';

const CreateMusicNFTPage = () => {
  const { walletAddress, connected } = useSolanaWallet();
  const { createMusicNFT, isReady } = useMetaplex();
  
  // Form state
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [editions, setEditions] = useState(10);
  const [royalty, setRoyalty] = useState(5); // 5%
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
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
          }
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
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="bg-gray-900 bg-opacity-60 backdrop-blur-lg rounded-xl border border-purple-900/20 p-6 md:p-8">
        <h1 className="text-3xl font-extrabold text-white mb-2">Create Music NFT</h1>
        <p className="text-purple-300 mb-8">Mint your music as an NFT on Solana in just a few steps</p>
        
        {!connected ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-6 text-center">
              <Music size={48} className="mx-auto text-purple-500 mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Connect your wallet to get started</h2>
              <p className="text-gray-400 mb-6">You need to connect your Solana wallet first</p>
            </div>
            <WalletConnectButton />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cover Image Upload */}
              <div className="md:col-span-1 order-1">
                <div 
                  className={`border-2 border-dashed rounded-xl overflow-hidden aspect-square flex flex-col items-center justify-center cursor-pointer relative ${
                    coverImagePreview ? 'border-transparent' : 'border-purple-600/40 hover:border-purple-500/70'
                  }`}
                  onClick={() => coverImageInputRef.current?.click()}
                >
                  {coverImagePreview ? (
                    <img 
                      src={coverImagePreview} 
                      alt="Cover preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-6">
                      <Image size={48} className="mx-auto text-purple-500 mb-4" />
                      <h3 className="text-white font-medium mb-1">Upload Cover Art</h3>
                      <p className="text-gray-400 text-sm">Click to select an image file</p>
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
              <div className="md:col-span-1 order-2 flex flex-col space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                    Track Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter track title"
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="artist" className="block text-sm font-medium text-gray-300 mb-1">
                    Artist Name *
                  </label>
                  <input
                    id="artist"
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="Enter artist name"
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="symbol" className="block text-sm font-medium text-gray-300 mb-1">
                    Token Symbol *
                  </label>
                  <input
                    id="symbol"
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10))}
                    placeholder="SYMBOL (e.g. BEAT)"
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    maxLength={10}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="editions" className="block text-sm font-medium text-gray-300 mb-1">
                      Editions
                    </label>
                    <input
                      id="editions"
                      type="number"
                      value={editions}
                      onChange={(e) => setEditions(parseInt(e.target.value))}
                      min={1}
                      max={1000}
                      required
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="royalty" className="block text-sm font-medium text-gray-300 mb-1">
                      Royalty %
                    </label>
                    <input
                      id="royalty"
                      type="number"
                      value={royalty}
                      onChange={(e) => setRoyalty(parseInt(e.target.value))}
                      min={0}
                      max={50}
                      required
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter track description"
                    rows={3}
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <button
                    type="button"
                    className={`w-full border border-purple-600 rounded-lg px-4 py-3 flex items-center justify-center gap-2 ${
                      audioFile ? 'bg-purple-900/30 text-white' : 'bg-transparent text-purple-500 hover:bg-purple-900/20'
                    }`}
                    onClick={() => audioFileInputRef.current?.click()}
                  >
                    <Music size={20} />
                    {audioFile ? `Selected: ${audioFile.name}` : 'Upload Audio File *'}
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
              </div>
              
              {/* Submit Section */}
              <div className="md:col-span-2 order-3 border-t border-gray-800 pt-6 mt-4">
                <div className="flex flex-col">
                  <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <Info className="text-purple-400 mt-0.5 flex-shrink-0" size={18} />
                    <div className="text-sm text-purple-300">
                      <p className="font-medium mb-1">Important information</p>
                      <p>Minting NFTs requires small transaction fees paid in SOL. Make sure you have enough SOL in your wallet to cover gas fees.</p>
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                    disabled={isLoading || !coverImage || !audioFile}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-white" />
                        Creating NFT...
                      </>
                    ) : (
                      <>
                        <Upload size={20} />
                        Mint Music NFT
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateMusicNFTPage;
