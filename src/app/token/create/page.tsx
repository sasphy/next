'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Music, 
  Upload, 
  Disc, 
  LineChart,
  Check,
  ChevronDown
} from 'lucide-react';
import { BondingCurveType } from '@/lib/types';
import { getBondingCurveDescription } from '@/lib/market-utils';
import { uploadTrackToIPFS } from '@/lib/ipfs-storage';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';
import { useMutation } from 'convex/react';
import { api } from '@/../../convex/_generated/api';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createMusicToken } from '@/services/chain/token-factory';
import './styles.css';

// Simple form field component
const FormField = ({ 
  label, 
  children 
}: { 
  label: string, 
  children: React.ReactNode 
}) => (
  <div className="mb-6">
    <label className="block text-sm font-medium mb-2">{label}</label>
    {children}
  </div>
);

// Helper function to save token data to Convex
const saveTokenToConvex = async (tokenData: {
  title: string;
  artist: string;
  description: string;
  initialPrice: number;
  delta: number;
  curveType: string;
  metadataUrl: string;
  audioUrl: string;
  imageUrl: string;
  walletAddress: string;
  network: string;
}) => {
  try {
    const saveToken = useMutation(api.tokens.saveToken);
    const tokenId = await saveToken({
      title: tokenData.title,
      artist: tokenData.artist,
      description: tokenData.description,
      initialPrice: tokenData.initialPrice,
      delta: tokenData.delta,
      curveType: tokenData.curveType,
      metadataUrl: tokenData.metadataUrl,
      audioUrl: tokenData.audioUrl,
      imageUrl: tokenData.imageUrl,
      walletAddress: tokenData.walletAddress,
      network: tokenData.network,
    });
    
    return tokenId;
  } catch (error) {
    console.error("Error saving token to Convex:", error);
    throw new Error("Failed to save token data");
  }
};

export default function CreateTokenPage() {
  // Form state
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [description, setDescription] = useState('');
  const [initialPrice, setInitialPrice] = useState(0.1);
  const [delta, setDelta] = useState(0.01);
  const [curveType, setCurveType] = useState<BondingCurveType>('LINEAR');
  const [bondingCurveDescription, setBondingCurveDescription] = useState(getBondingCurveDescription('LINEAR'));
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Image preview
  const [previewUrl, setPreviewUrl] = useState('');
  
  // Upload tracking
  const [uploadProgress, setUploadProgress] = useState(0);
  const [ipfsUrls, setIpfsUrls] = useState<{ 
    metadataUrl: string; 
    audioUrl: string; 
    imageUrl: string;
    metadataHash: string;
    audioHash: string;
    imageHash: string;
  } | null>(null);
  
  // Solana wallet connection
  const wallet = useWallet();
  
  // Convex mutation to record token creation
  const saveTokenToConvex = useMutation(api.tokens.saveToken);
  // Add mutation for updating token address
  const updateTokenAddress = useMutation(api.tokens.updateTokenAddress);

  // Handle curve type change
  const handleCurveTypeChange = (newType: BondingCurveType) => {
    setCurveType(newType);
    setBondingCurveDescription(getBondingCurveDescription(newType));
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Handle audio upload
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!coverImage || !audioFile || !title || !artist || !description || !wallet.publicKey) {
      toast.error("Please fill in all required fields and connect your wallet");
      return;
    }
    
    setIsSubmitting(true);
    setUploadProgress(10);
    
    try {
      // 1. Upload files to IPFS
      toast.info("Uploading files to IPFS...");
      setUploadProgress(20);
      
      const ipfsResults = await uploadTrackToIPFS(
        audioFile,
        coverImage,
        {
          name: title,
          symbol: title.split(' ').map(word => word[0]?.toUpperCase() || '').join('').slice(0, 5),
          description,
          genre: "Music",
          artist,
          artistAddress: wallet.publicKey.toString(),
          initialPrice: initialPrice.toString(),
          curveType,
          delta: delta.toString(),
        }
      );
      
      setIpfsUrls(ipfsResults);
      setUploadProgress(50);
      toast.success("Files uploaded to IPFS successfully");
      
      // Get the current network from environment
      const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK?.toLowerCase() || 'devnet';
      let txHash = null;
      let tokenAddress = null;
      
      // 2. Store token data in Convex
      const savedToken = await saveTokenToConvex({
        title,
        artist,
        description,
        initialPrice,
        delta,
        curveType,
        metadataUrl: ipfsResults.metadataUrl,
        audioUrl: ipfsResults.audioUrl,
        imageUrl: ipfsResults.imageUrl,
        walletAddress: wallet.publicKey.toString(),
        network, // Pass the network to the Convex function
      });
      
      setUploadProgress(75);
      toast.success("Token data saved to database");
      
      // 3. Create the token on Solana blockchain
      try {
        toast.info(`Creating token on Solana ${network}...`);
        
        // Initialize connection to Solana devnet or mainnet based on environment
        const cluster = network === 'mainnet' ? 'mainnet-beta' : 'devnet';
        const connection = new Connection(clusterApiUrl(cluster), 'confirmed');
        
        if (!wallet.signTransaction) {
          throw new Error("Wallet cannot sign transactions");
        }
        
        // Wrap the wallet to match the expected interface
        const nodeWallet = {
          publicKey: wallet.publicKey,
          signTransaction: wallet.signTransaction,
          signAllTransactions: wallet.signAllTransactions,
        };
        
        // Create the music token
        const tokenResult = await createMusicToken(
          connection,
          nodeWallet as any, // Type coercion to satisfy the Wallet interface
          {
            name: title,
            symbol: title.split(' ').map(word => word[0]?.toUpperCase() || '').join('').slice(0, 5),
            metadataUri: ipfsResults.metadataUrl,
            initialPrice,
            delta,
            curveType,
          }
        );
        
        if (!tokenResult.success) {
          console.warn("Blockchain creation warning:", tokenResult.error);
          toast.warning("Created in database but blockchain creation failed - will retry later");
        } else {
          // If successful, extract the token address from the result
          // The signature might be used as txHash depending on the implementation
          const signature = tokenResult.signature || '';
          
          // Update the token address in Convex if we have required data
          if (signature && typeof savedToken.tokenId === 'string') {
            await updateTokenAddress({
              id: savedToken.tokenId,
              tokenAddress: signature, // Using signature as token identifier
              txHash: signature,
              network,
            });
          }
          
          toast.success(`Token created successfully on Solana ${network.charAt(0).toUpperCase() + network.slice(1)}!`);
        }
      } catch (blockchainError) {
        console.error("Blockchain error:", blockchainError);
        toast.warning("Token saved to database but blockchain creation failed - will retry later");
        // We continue even if blockchain creation fails, since we've saved to the database
      }
      
      setUploadProgress(100);
      
      // Success - move to success step
      setIsSubmitting(false);
      setCurrentStep(4);
    } catch (error) {
      console.error("Error creating token:", error);
      toast.error("Failed to create token: " + (error instanceof Error ? error.message : 'Unknown error'));
      setIsSubmitting(false);
    }
  };

  // Next step
  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  // Previous step
  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">Create a Music Token</h1>
        <p className="text-muted-foreground mb-8">
          Tokenize your music with bonding curve economics. Set parameters for how your token's price will evolve over time.
        </p>

        {/* Progress steps */}
        <div className="mb-10">
          <div className="flex justify-between relative">
            {/* Add line container that spans across all steps */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted-foreground/30"></div>
            
            {/* Line that represents progress */}
            <div 
              className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-300 progress-bar" 
              style={{ 
                '--current-step': currentStep 
              } as React.CSSProperties}
            ></div>
            
            {[1, 2, 3, 4].map(step => (
              <div 
                key={step} 
                className={`relative flex flex-col items-center z-10 ${step <= currentStep ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mb-2 bg-background ${
                  step < currentStep ? 'bg-primary border-primary text-primary-foreground' : 
                  step === currentStep ? 'border-primary' : 'border-muted-foreground'
                }`}>
                  {step < currentStep ? <Check className="h-4 w-4" /> : step}
                </div>
                <div className="text-xs text-center">
                  {step === 1 ? "Info" : 
                   step === 2 ? "Files" : 
                   step === 3 ? "Economics" : "Done"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Music className="h-5 w-5 text-primary" />
              Track Information
            </h2>
            <form>
              <FormField label="Track Title">
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter your track title"
                  required
                />
              </FormField>
              
              <FormField label="Artist Name">
                <input 
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="w-full px-4 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter artist name"
                  required
                />
              </FormField>
              
              <FormField label="Description">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
                  placeholder="Describe your track and the token opportunity"
                  required
                />
              </FormField>
              
              <div className="flex justify-end mt-8">
                <button
                  type="button"
                  onClick={nextStep}
                  className="solana-button inline-flex items-center px-6 py-3"
                  disabled={!title || !artist || !description}
                >
                  Next Step
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Step 2: Upload Files */}
        {currentStep === 2 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Upload Media
            </h2>
            <form>
              <FormField label="Cover Image">
                <div className="border-2 border-dashed border-border p-6 rounded-md text-center">
                  {previewUrl ? (
                    <div className="relative w-full max-w-[200px] mx-auto aspect-square mb-4">
                      <img 
                        src={previewUrl} 
                        alt="Cover preview" 
                        className="w-full h-full object-cover rounded-md"
                      />
                      <button 
                        type="button"
                        aria-label="Remove cover image"
                        onClick={() => {
                          setCoverImage(null);
                          setPreviewUrl('');
                        }}
                        className="remove-button"
                      >
                        <svg className="remove-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6 6 18"></path>
                          <path d="m6 6 12 12"></path>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="text-muted-foreground mb-4">
                      <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                        <Upload className="h-8 w-8 text-primary" />
                      </div>
                      <p>Drag & drop or browse files</p>
                      <p className="text-xs mt-1">PNG, JPG, or GIF, max 5MB</p>
                    </div>
                  )}
                  <input 
                    type="file"
                    id="coverImage"
                    onChange={handleImageUpload}
                    accept="image/png, image/jpeg, image/gif"
                    className="hidden"
                  />
                  <label 
                    htmlFor="coverImage" 
                    className="mt-2 inline-block px-4 py-2 bg-primary/10 text-primary rounded-md cursor-pointer hover:bg-primary/20 transition-colors"
                  >
                    {previewUrl ? 'Change Image' : 'Select Image'}
                  </label>
                </div>
              </FormField>
              
              <FormField label="Audio File">
                <div className="border-2 border-dashed border-border p-6 rounded-md text-center">
                  {audioFile ? (
                    <div className="bg-primary/10 p-4 rounded-lg mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Disc className="h-6 w-6 text-primary" />
                          <div className="text-left">
                            <p className="font-medium">{audioFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button 
                          type="button"
                          aria-label="Remove audio file"
                          onClick={() => setAudioFile(null)}
                          className="p-1"
                        >
                          <svg className="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 6 18"></path>
                            <path d="m6 6 12 12"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground mb-4">
                      <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                        <Music className="h-8 w-8 text-primary" />
                      </div>
                      <p>Drag & drop or browse files</p>
                      <p className="text-xs mt-1">MP3, WAV, or FLAC, max 50MB</p>
                    </div>
                  )}
                  <input 
                    type="file"
                    id="audioFile"
                    onChange={handleAudioUpload}
                    accept="audio/mpeg, audio/wav, audio/flac"
                    className="hidden"
                  />
                  <label 
                    htmlFor="audioFile" 
                    className="mt-2 inline-block px-4 py-2 bg-primary/10 text-primary rounded-md cursor-pointer hover:bg-primary/20 transition-colors"
                  >
                    {audioFile ? 'Change Audio' : 'Select Audio File'}
                  </label>
                </div>
              </FormField>
              
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 border border-border rounded-md hover:bg-card/80 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="solana-button inline-flex items-center px-6 py-3"
                  disabled={!coverImage || !audioFile}
                >
                  Next Step
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Step 3: Token Economics */}
        {currentStep === 3 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <LineChart className="h-5 w-5 text-primary" />
              Token Economics
            </h2>
            <form onSubmit={handleSubmit}>
              <FormField label="Initial Price (SOL)">
                <input 
                  type="number"
                  value={initialPrice}
                  onChange={(e) => setInitialPrice(Number(e.target.value))}
                  step="0.01"
                  min="0.01"
                  className="w-full px-4 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Initial price in SOL"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This is the price at which the first token will be sold
                </p>
              </FormField>
              
              <FormField label="Bonding Curve Type">
                <div className="relative">
                  <select 
                    value={curveType} 
                    onChange={(e) => handleCurveTypeChange(e.target.value as BondingCurveType)}
                    className="w-full px-4 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                    required
                    aria-label="Bonding curve type"
                  >
                    <option value="LINEAR">Linear Curve</option>
                    <option value="EXPONENTIAL">Exponential Curve</option>
                    <option value="LOGARITHMIC">Logarithmic Curve</option>
                    <option value="SIGMOID">S-Curve (Sigmoid)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {bondingCurveDescription}
                </p>
              </FormField>
              
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-6">
                <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                  <svg className="svg-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="12" cy="16" r="1" fill="currentColor" />
                  </svg>
                  How Bonding Curves Work
                </h3>
                <p className="text-sm text-muted-foreground">
                  Bonding curves automatically set pricing based on the token supply. As more people buy your tokens, the price increases according to the formula determined by your chosen curve type. Early supporters benefit from price appreciation as your music becomes more popular.
                </p>
              </div>
              
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 border border-border rounded-md hover:bg-card/80 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="solana-button inline-flex items-center gap-2 px-6 py-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-primary-foreground/50 border-t-primary-foreground rounded-full animate-spin" />
                      Creating Token...
                    </>
                  ) : (
                    'Create Token'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Step 4: Success */}
        {currentStep === 4 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className="bg-primary/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">Token Created Successfully!</h2>
            <p className="text-muted-foreground mb-8">
              Your music token has been created and is now available in the marketplace.
            </p>
            <div className="bg-card p-6 rounded-lg border border-border mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">{title}</h3>
                <div className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  {curveType} Curve
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Initial Price</p>
                  <p className="font-medium">{initialPrice} SOL</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Current Supply</p>
                  <p className="font-medium">0 / ∞</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium text-green-500">Active</p>
                </div>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <a 
                href="/token/explore" 
                className="px-6 py-3 border border-border rounded-md hover:bg-card/80 transition-colors"
              >
                Back to Explore
              </a>
              <a 
                href={`/token/tokens/${title.toLowerCase().replace(/\s+/g, '-')}`} 
                className="solana-button px-6 py-3"
              >
                View Token Page
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 