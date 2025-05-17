'use client';

import { useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ChevronLeft, ChevronRight, ArrowRight, 
  Music, Headphones, ShieldCheck, LineChart, Users, 
  Network, Lock, Code, Database, Layers,
  Zap, Share2, CheckCircle, Search, Wallet,
  Play, PanelLeft, FileText, Presentation,
  Cog, ToggleLeft, ToggleRight, Smartphone, Stars
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Define types for our slides
interface Slide {
  title: string;
  content: ReactNode;
  bg?: string;
  layoutClass?: string;
  pitchOnly?: boolean;
  techOnly?: boolean;
}

export default function SlidesPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [presentationMode, setPresentationMode] = useState<'pitch' | 'technical'>('pitch');
  
  // Define slides array
  const allSlides: Slide[] = [
    // Slide 1: Title
    {
      title: "sasphy",
      bg: "solana-slide-bg-1",
      layoutClass: "flex flex-col items-center justify-center",
      content: (
        <>
          <div className="flex items-center gap-4">
            <div className="solana-logo">
              {/* <svg width="100" height="100" viewBox="0 0 397 311" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h320.3c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" fill="url(#paint0_linear)"/>
                <path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h320.3c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" fill="url(#paint1_linear)"/>
                <path d="M332.4 120.8c-2.4-2.4-5.7-3.8-9.2-3.8H2.9c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h320.3c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" fill="url(#paint2_linear)"/>
                <defs>
                  <linearGradient id="paint0_linear" x1="352.834" y1="333.066" x2="201.539" y2="196.379" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#00FFA3"/>
                    <stop offset="1" stopColor="#DC1FFF"/>
                  </linearGradient>
                  <linearGradient id="paint1_linear" x1="352.834" y1="333.066" x2="201.539" y2="196.379" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#00FFA3"/>
                    <stop offset="1" stopColor="#DC1FFF"/>
                  </linearGradient>
                  <linearGradient id="paint2_linear" x1="352.834" y1="333.066" x2="201.539" y2="196.379" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#00FFA3"/>
                    <stop offset="1" stopColor="#DC1FFF"/>
                  </linearGradient>
                </defs>
              </svg> */}
            </div>
            <h2 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-solana-primary to-solana-secondary bg-clip-text text-transparent">Sasphy</h2>
          </div>
          <p className="text-xl md:text-2xl text-center max-w-3xl mt-4 text-zinc-300">
            A decentralized music streaming platform built on Solana that empowers artists and rewards listeners through social influence and discovery.
          </p>
          <div className="mt-10 flex justify-center">
            <div className="glass-panel p-4 rounded-lg max-w-lg">
              <Image 
                src="/assets/album-covers/cover-1.jpg" 
                alt="Music Platform" 
                width={500} 
                height={300}
                className="rounded-lg shadow-2xl opacity-90"
              />
            </div>
          </div>
        </>
      )
    },
    
    // Slide 2: Problem Statement
    {
      title: "The Problem",
      bg: "solana-slide-bg-2",
      layoutClass: "slide-two-column",
      content: (
        <>
          <div className="flex flex-col justify-center">
            <ul className="space-y-6">
              <li className="slide-list-item">
                <span className="slide-list-icon bg-red-500">1</span>
                <span><strong>Unfair Compensation:</strong> Current platforms pay artists fractions of a penny per stream.</span>
              </li>
              <li className="slide-list-item">
                <span className="slide-list-icon bg-red-500">2</span>
                <span><strong>Middleman Control:</strong> Traditional platforms take up to 70% of all revenue.</span>
              </li>
              <li className="slide-list-item">
                <span className="slide-list-icon bg-red-500">3</span>
                <span><strong>Zero Fan Rewards:</strong> Listeners discover new music but receive no incentives.</span>
              </li>
              <li className="slide-list-item">
                <span className="slide-list-icon bg-red-500">4</span>
                <span><strong>Complex Rights Management:</strong> Opaque royalty systems and payment delays.</span>
              </li>
            </ul>
          </div>
          <div className="slide-image-container">
            <div className="glass-card p-6 rounded-xl">
              <div className="mb-4 text-xl font-bold text-center">Current Streaming Economics</div>
              <div className="flex items-center justify-center gap-8 mb-6">
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-red-500/20 p-3 mb-2">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#ef4444" strokeWidth="2"/>
                      <path d="M15 9L9 15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M9 9L15 15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="text-sm text-center">$0.003-$0.005<br/>per stream</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-red-500/20 p-3 mb-2">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#ef4444" strokeWidth="2"/>
                      <path d="M15 9L9 15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M9 9L15 15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="text-sm text-center">$0 for<br/>listeners</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-red-500/20 p-3 mb-2">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#ef4444" strokeWidth="2"/>
                      <path d="M15 9L9 15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M9 9L15 15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="text-sm text-center">30-90 day<br/>payment delays</div>
                </div>
              </div>
              <div className="text-center mt-4">
                <Image 
                  src="/assets/album-8.jpg" 
                  alt="Traditional Streaming Problems" 
                  width={300} 
                  height={200}
                  className="rounded-lg mx-auto opacity-80"
                />
              </div>
            </div>
          </div>
        </>
      )
    },
    
    // Slide 3: Solution
    {
      title: "The Solution: Sasphy",
      bg: "solana-slide-bg-3",
      layoutClass: "slide-two-column",
      content: (
        <>
          <div className="slide-image-container">
            <div className="glass-card p-6 rounded-xl">
              <div className="text-center mb-6">
                <div className="flex justify-center gap-4 mb-4">
                  <div className="rounded-full p-3 bg-solana-primary">
                    <Music className="text-white" size={32} />
                  </div>
                  <div className="rounded-full p-3 bg-solana-secondary">
                    <Headphones className="text-white" size={32} />
                  </div>
                </div>
                <div className="text-xl font-bold">Web3 Music Streaming</div>
              </div>
              <div className="bg-black/20 rounded-lg p-4 mb-4">
                <div className="text-sm font-mono text-zinc-300 mb-2">// Solana Metaplex NFT</div>
                <div className="text-xs font-mono text-zinc-400 break-all">
                  {`{
  "artist": "DpQxJAXHuKkKQmTnkA8ZFRt4YMDz2Uaa4G2rWdStjuNm",
  "tokenURI": "ipfs://QmT8e...",
  "editions": 1000,
  "price": "0.25 SOL",
  "royalty": "10%"
}`}
                </div>
              </div>
              <div className="text-center text-sm text-zinc-400">
                Music as tokenized assets on Solana blockchain
              </div>
              <div className="mt-4">
                <Image 
                  src="/assets/album-3.jpg" 
                  alt="Sasphy Platform" 
                  width={300} 
                  height={200}
                  className="rounded-lg mx-auto"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-2xl mb-6">Sasphy leverages Solana to deliver:</p>
            <ul className="space-y-4">
              <li className="slide-list-item">
                <span className="slide-list-icon bg-green-600">✓</span>
                <span><strong>Music NFTs:</strong> Metaplex multi-edition tokens for track ownership.</span>
              </li>
              <li className="slide-list-item">
                <span className="slide-list-icon bg-green-600">✓</span>
                <span><strong>Direct Artist Compensation:</strong> Sub-second finality with 0.00025 SOL fees.</span>
              </li>
              <li className="slide-list-item">
                <span className="slide-list-icon bg-green-600">✓</span>
                <span><strong>Influence Rewards:</strong> Listeners earn for discovering trending tracks.</span>
              </li>
              <li className="slide-list-item">
                <span className="slide-list-icon bg-green-600">✓</span>
                <span><strong>AI Radio Host:</strong> Personalized DJ experience enhances discovery.</span>
              </li>
            </ul>
          </div>
        </>
      )
    },
    
    // Slide 4: Key Components
    {
      title: "Key Components",
      bg: "solana-slide-bg-4",
      layoutClass: "flex flex-col justify-center items-center",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
          {[ 
            { 
              title: "Metaplex NFTs", 
              desc: "Multi-edition tokens for music ownership", 
              icon: <Code className="w-8 h-8"/> 
            },
            { 
              title: "Bonding Curves", 
              desc: "Dynamic pricing based on track popularity", 
              icon: <LineChart className="w-8 h-8"/> 
            },
            { 
              title: "AI Radio Host", 
              desc: "Gemini-powered DJ for personalized curation", 
              icon: <Headphones className="w-8 h-8"/> 
            },
            { 
              title: "React 19 Frontend", 
              desc: "Modern UI with Next.js 15", 
              icon: <Users className="w-8 h-8"/> 
            },
          ].map((feature, index) => (
            <div key={index} className="bg-white/10 p-6 rounded-lg flex flex-col items-center text-center shadow-lg hover:bg-white/15 transition-colors">
              <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-solana-primary to-solana-secondary text-white flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-zinc-300">{feature.desc}</p>
            </div>
          ))}
        </div>
      )
    },
    
    // Slide 5: Technical Architecture
    {
      title: "Technical Architecture",
      bg: "solana-slide-bg-5",
      layoutClass: "flex flex-col justify-center items-center",
      content: (
        <div className="w-full max-w-5xl mx-auto">
          <div className="glass-card p-8 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black/20 p-5 rounded-lg text-center flex flex-col items-center">
                <Users className="w-10 h-10 mb-3 text-solana-secondary"/>
                <h4 className="text-lg font-semibold mb-2">Frontend</h4>
                <div className="text-sm text-zinc-400 mb-4">User Interface</div>
                <div className="text-xs text-left text-zinc-500">
                  <div>• Next.js 15.3.1 with React 19</div>
                  <div>• @solana/wallet-adapter</div>
                  <div>• Tailwind CSS v4</div>
                </div>
              </div>
              
              <div className="bg-black/20 p-5 rounded-lg text-center flex flex-col items-center">
                <Code className="w-10 h-10 mb-3 text-blue-400"/>
                <h4 className="text-lg font-semibold mb-2">Smart Contracts</h4>
                <div className="text-sm text-zinc-400 mb-4">Anchor Framework</div>
                <div className="text-xs text-left text-zinc-500">
                  <div>• MusicTokenFactory.sol</div>
                  <div>• Multi-edition Metaplex tokens</div>
                  <div>• Bonding curve economics</div>
                </div>
              </div>
              
              <div className="bg-black/20 p-5 rounded-lg text-center flex flex-col items-center">
                <Headphones className="w-10 h-10 mb-3 text-purple-400"/>
                <h4 className="text-lg font-semibold mb-2">AI Services</h4>
                <div className="text-sm text-zinc-400 mb-4">Personalized DJ</div>
                <div className="text-xs text-left text-zinc-500">
                  <div>• Gemini 2.5 Flash API</div>
                  <div>• Zonos TTS Voice Synthesis</div>
                  <div>• Bun Runtime with Redis</div>
                </div>
              </div>
            </div>
            
            <div className="my-8 border-t border-white/10"></div>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <div className="flex flex-col items-center">
                <Database className="w-8 h-8 mb-2 text-solana-primary"/>
                <h5 className="text-base font-medium">IPFS Storage</h5>
                <div className="text-xs text-zinc-500">Decentralized Content</div>
              </div>
              
              <div className="hidden md:block h-20 border-l border-white/10"></div>
              
              <div className="flex flex-col items-center">
                <Layers className="w-8 h-8 mb-2 text-green-500"/>
                <h5 className="text-base font-medium">Solana Chain</h5>
                <div className="text-xs text-zinc-500">65,000 TPS / 400ms Finality</div>
              </div>
              
              <div className="hidden md:block h-20 border-l border-white/10"></div>
              
              <div className="flex flex-col items-center">
                <Network className="w-8 h-8 mb-2 text-blue-500"/>
                <h5 className="text-base font-medium">AWS Hosting</h5>
                <div className="text-xs text-zinc-500">S3, DynamoDB, CloudFront</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    
    // Slide 6: Solana Benefits
    {
      title: "Why Solana?",
      bg: "solana-slide-bg-6",
      layoutClass: "slide-two-column",
      content: (
        <>
          <div className="flex flex-col justify-center">
            <h3 className="text-3xl font-bold mb-6 solana-gradient">The Perfect Chain for Music</h3>
            <ul className="space-y-5">
              <li className="slide-list-item">
                <span className="slide-list-icon bg-[#00FFA3]">1</span>
                <span><strong>Speed:</strong> 65,000 TPS with 400ms finality for instant transactions.</span>
              </li>
              <li className="slide-list-item">
                <span className="slide-list-icon bg-[#00FFA3]">2</span>
                <span><strong>Low Fees:</strong> $0.00025 per transaction, making micropayments viable.</span>
              </li>
              <li className="slide-list-item">
                <span className="slide-list-icon bg-[#00FFA3]">3</span>
                <span><strong>NFT Ecosystem:</strong> Metaplex standard with robust royalty enforcement.</span>
              </li>
              <li className="slide-list-item">
                <span className="slide-list-icon bg-[#00FFA3]">4</span>
                <span><strong>Composability:</strong> Seamless integration with other Solana protocols.</span>
              </li>
              <li className="slide-list-item">
                <span className="slide-list-icon bg-[#00FFA3]">5</span>
                <span><strong>Mobile Integration:</strong> Solana Mobile Stack for native experiences.</span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="solana-feature-container">
              <div className="solana-pulse-container">
                <div className="solana-pulse-ring"></div>
                <div className="solana-pulse-dot"></div>
              </div>
              <div className="solana-stats-card glass-card p-6 rounded-xl mb-6">
                <div className="text-xl font-bold mb-4 text-center solana-gradient">Solana Network Stats</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="stat-item">
                    <div className="stat-value">3,850+</div>
                    <div className="stat-label">TPS Average</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">208B+</div>
                    <div className="stat-label">Total Transactions</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">1,900+</div>
                    <div className="stat-label">Validator Nodes</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">$0.00025</div>
                    <div className="stat-label">Avg Transaction Fee</div>
                  </div>
                </div>
              </div>
              <div className="solana-token-example p-4 bg-black/30 rounded-xl border border-solana-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <Play size={20} className="text-solana-primary" />
                  <div className="text-sm font-semibold">Example NFT Token Response</div>
                </div>
                <pre className="text-xs text-zinc-400 overflow-auto p-2">
                  {`{
  "mint": "98tFmEvmnEWRLR7WMK91derTYmJHZxr7rjgxC8P5e1Zh",
  "tokenFactory": "DnRHRwJv7VabUjWVdQKMxwAGvXD3AULofxqGhFoGNVqf",
  "artist": "GaK8DlxZLFj31eu7uTp5RFvXVXetANaz7L57489Yc1WY",
  "name": "Groove Theory",
  "symbol": "GT",
  "uri": "ipfs://QmXHEj6mMArGi9aUBVB8tQQcTnXeTrZzHT5sRpVFq9qQdo",
  "initialPrice": 0.1,
  "delta": 0.01,
  "curveType": "linear",
  "artistFee": 1000,
  "platformFee": 250
}`}
                </pre>
              </div>
            </div>
          </div>
        </>
      )
    },
    
    // Slide 7: User Experience Flow
    {
      title: "User Experience Flow",
      bg: "solana-slide-bg-2",
      layoutClass: "flex flex-col justify-center items-center",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          <div className="bg-white/10 p-6 rounded-lg text-center shadow-lg">
            <div className="w-14 h-14 mb-4 mx-auto rounded-full bg-solana-primary text-white flex items-center justify-center text-2xl font-bold">1</div>
            <h3 className="text-xl font-semibold mb-2">Discovery</h3>
            <p className="text-zinc-300 text-sm">Browse music through the swipe interface while AI DJ "Tempo" introduces tracks.</p>
            <div className="mt-4">
              <Search className="w-10 h-10 mx-auto text-solana-secondary opacity-75" />
            </div>
          </div>
          
          <div className="bg-white/10 p-6 rounded-lg text-center shadow-lg">
            <div className="w-14 h-14 mb-4 mx-auto rounded-full bg-solana-primary text-white flex items-center justify-center text-2xl font-bold">2</div>
            <h3 className="text-xl font-semibold mb-2">Purchase</h3>
            <p className="text-zinc-300 text-sm">Buy track tokens directly from artists using your connected Solana wallet.</p>
            <div className="mt-4">
              <Wallet className="w-10 h-10 mx-auto text-solana-secondary opacity-75" />
            </div>
          </div>
          
          <div className="bg-white/10 p-6 rounded-lg text-center shadow-lg">
            <div className="w-14 h-14 mb-4 mx-auto rounded-full bg-solana-primary text-white flex items-center justify-center text-2xl font-bold">3</div>
            <h3 className="text-xl font-semibold mb-2">Build Influence</h3>
            <p className="text-zinc-300 text-sm">Earn discovery badges and influence score as tracks you discover gain popularity.</p>
            <div className="mt-4">
              <Share2 className="w-10 h-10 mx-auto text-solana-secondary opacity-75" />
            </div>
          </div>
          
          <div className="bg-white/10 p-6 rounded-lg text-center shadow-lg col-span-1 md:col-span-3">
            <div className="flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-solana-primary mr-2" />
              <h3 className="text-xl font-semibold">Key Benefits</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-black/20 p-3 rounded flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" />
                <span className="text-sm text-zinc-300">Instant Solana payments</span>
              </div>
              <div className="bg-black/20 p-3 rounded flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" />
                <span className="text-sm text-zinc-300">Fair creator compensation</span>
              </div>
              <div className="bg-black/20 p-3 rounded flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" />
                <span className="text-sm text-zinc-300">Social influence incentives</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    
    // Slide 8: Market Opportunity
    {
      title: "Market Opportunity",
      bg: "solana-slide-bg-7",
      layoutClass: "slide-two-column",
      content: (
        <>
          <div className="flex flex-col justify-center">
            <h3 className="text-3xl font-bold mb-6">Massive Growth Potential</h3>
            <ul className="space-y-5">
              <li className="slide-list-item">
                <span className="slide-list-icon bg-purple-600"><PanelLeft size={16}/></span>
                <span><strong>$30B+ Music Streaming Market</strong> growing at 14.5% CAGR</span>
              </li>
              <li className="slide-list-item">
                <span className="slide-list-icon bg-purple-600"><PanelLeft size={16}/></span>
                <span><strong>$5B+ NFT Market</strong> with music being fastest growing segment</span>
              </li>
              <li className="slide-list-item">
                <span className="slide-list-icon bg-purple-600"><PanelLeft size={16}/></span>
                <span><strong>20+ Million Solana Wallet Users</strong> and expanding rapidly</span>
              </li>
              <li className="slide-list-item">
                <span className="slide-list-icon bg-purple-600"><PanelLeft size={16}/></span>
                <span><strong>50,000+ Independent Artists</strong> looking for alternative platforms</span>
              </li>
            </ul>
            <div className="mt-6 p-4 bg-black/20 rounded-lg border border-purple-500/20">
              <h4 className="text-lg font-semibold mb-2 flex items-center">
                <FileText size={18} className="mr-2 text-solana-primary" />
                Target Metrics
              </h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-solana-primary mr-2"></div>
                  <span>10,000 Daily Active Users by Q4 2025</span>
                </li>
                <li className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-solana-secondary mr-2"></div>
                  <span>5,000+ Music NFTs Minted in First Year</span>
                </li>
                <li className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                  <span>$2M+ Total Transaction Volume Year One</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="slide-image-container">
            <div className="market-chart">
              <div className="bg-black/40 p-5 rounded-xl border border-purple-500/20">
                <h4 className="text-lg font-semibold mb-4 text-center">Market Growth Projection</h4>
                <div className="chart-container h-64 relative">
                  <div className="chart-grid absolute inset-0 grid grid-cols-4 grid-rows-5">
                    {Array(20).fill(0).map((_, i) => (
                      <div key={i} className="border-b border-r border-white/10"></div>
                    ))}
                  </div>
                  
                  {/* Traditional Music Line */}
                  <div className="chart-line absolute left-0 bottom-0 w-full h-full">
                    <svg width="100%" height="100%" viewBox="0 0 400 250" preserveAspectRatio="none">
                      <path d="M0,250 C20,240 40,230 60,220 C80,210 100,205 120,200 C140,195 160,190 180,185 C200,180 220,170 240,155 C260,140 280,120 300,95 C320,70 340,40 360,20 C380,0 400,0 400,0" 
                            stroke="#9945FF" strokeWidth="3" fill="none" />
                    </svg>
                  </div>
                  
                  {/* Web3 Music Line */}
                  <div className="chart-line absolute left-0 bottom-0 w-full h-full">
                    <svg width="100%" height="100%" viewBox="0 0 400 250" preserveAspectRatio="none">
                      <path d="M0,250 C20,249 40,248 60,246 C80,244 100,242 120,238 C140,234 160,228 180,218 C200,208 220,190 240,160 C260,130 280,90 300,60 C320,30 340,10 360,0 C380,-10 400,-15 400,-15" 
                            stroke="#14F195" strokeWidth="3" fill="none" />
                    </svg>
                  </div>
                  
                  <div className="chart-labels absolute inset-0 flex justify-between pt-4 px-4">
                    <div className="text-xs text-zinc-400">2023</div>
                    <div className="text-xs text-zinc-400">2025</div>
                    <div className="text-xs text-zinc-400">2027</div>
                    <div className="text-xs text-zinc-400">2029</div>
                  </div>
                  
                  <div className="chart-legend absolute bottom-[-30px] left-0 w-full flex justify-center gap-8">
                    <div className="flex items-center text-xs">
                      <div className="w-3 h-3 rounded-full bg-[#9945FF] mr-1"></div>
                      <span>Traditional Music</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <div className="w-3 h-3 rounded-full bg-[#14F195] mr-1"></div>
                      <span>Web3 Music (Sasphy)</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10 space-y-3">
                  <div className="text-center text-lg">
                    <span className="font-bold gradient-text">Our Opportunity:</span>
                  </div>
                  <div className="p-3 bg-black/30 rounded-lg border border-solana-primary/20 text-center">
                    Capture the intersection of Solana users, music fans, and creator economy 
                    with a platform that equitably rewards all participants
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )
    },

    // Slide 9: Future Roadmap
    {
      title: "Future Roadmap",
      bg: "solana-slide-bg-3",
      layoutClass: "slide-two-column",
      content: (
        <>
          <div className="flex flex-col justify-center">
            <h3 className="text-3xl mb-6">The Vision Ahead</h3>
            <ul className="space-y-4">
              <li className="slide-list-item">
                <span className="slide-list-icon bg-blue-600"><LineChart size={16}/></span>
                <span><strong>Enhanced Analytics:</strong> Advanced artist and listener dashboards.</span>
              </li>
              <li className="slide-list-item">
                <span className="slide-list-icon bg-blue-600"><Users size={16}/></span>
                <span><strong>Creator Communities:</strong> Fan clubs and community ownership.</span>
              </li>
              <li className="slide-list-item">
                <span className="slide-list-icon bg-blue-600"><Network size={16}/></span>
                <span><strong>Mobile App:</strong> Solana Mobile Stack integration for native experience.</span>
              </li>
              <li className="slide-list-item">
                <span className="slide-list-icon bg-blue-600"><Lock size={16}/></span>
                <span><strong>Smart Contracts v2:</strong> Enhanced royalty distributions and label support.</span>
              </li>
            </ul>
             <div className="mt-8">
                <Link href="/">
                  <Button 
                    className="solana-button"
                    size="lg"
                  >
                    <span className="mr-2">Try Sasphy Now</span>
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
          </div>
          <div className="slide-image-container flex items-center justify-center">
            <div className="glass-card p-6 rounded-xl w-full max-w-xs">
              <div className="text-xl font-bold mb-4 text-center">Sasphy Roadmap</div>
              <div className="space-y-4">
                <div className="relative pl-8">
                  <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">✓</div>
                  <div>
                    <div className="text-base font-medium">Q2 2025</div>
                    <div className="text-sm text-zinc-400">Solana Breakout Hackathon Launch</div>
                  </div>
                </div>
                
                <div className="w-0.5 h-6 bg-white/20 ml-3"></div>
                
                <div className="relative pl-8">
                  <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">2</div>
                  <div>
                    <div className="text-base font-medium">Q3 2025</div>
                    <div className="text-sm text-zinc-400">AI Radio Integration</div>
                  </div>
                </div>
                
                <div className="w-0.5 h-6 bg-white/20 ml-3"></div>
                
                <div className="relative pl-8">
                  <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">3</div>
                  <div>
                    <div className="text-base font-medium">Q4 2025</div>
                    <div className="text-sm text-zinc-400">Solana Mobile Integration</div>
                  </div>
                </div>
                
                <div className="w-0.5 h-6 bg-white/20 ml-3"></div>
                
                <div className="relative pl-8">
                  <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs">4</div>
                  <div>
                    <div className="text-base font-medium">Q1 2026</div>
                    <div className="text-sm text-zinc-400">SPL Token & Governance</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )
    }
  ];

  // Filter slides based on presentation mode
  const slides = useMemo(() => {
    return allSlides.filter(slide => {
      if (presentationMode === 'pitch' && slide.techOnly) return false;
      if (presentationMode === 'technical' && slide.pitchOnly) return false;
      return true;
    });
  }, [allSlides, presentationMode]);

  // Navigation functions
  const totalSlides = slides.length;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  }, [totalSlides]);

  // Effect to setup animations after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Effect for Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        prevSlide();
      } else if (event.key === 'ArrowRight') {
        nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [prevSlide, nextSlide]);
  
  return (
    <div className={`min-h-screen flex flex-col ${slides[currentSlide]?.bg || 'solana-slide-bg-default'} text-white relative overflow-hidden transition-colors duration-700`}>
      {/* Background elements */}
      <div className="solana-bg-glow absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-30"></div>
      <div className="solana-bg-grid absolute inset-0 opacity-10"></div>
      
      <header className="p-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center group">
          <div className="mr-3 relative">
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-60 bg-[#14F195] filter blur-md transition-opacity duration-700"></div>
            <svg width="40" height="40" viewBox="0 0 397 311" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
              <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h320.3c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" fill="url(#paint0_linear)"/>
              <path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h320.3c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" fill="url(#paint1_linear)"/>
              <path d="M332.4 120.8c-2.4-2.4-5.7-3.8-9.2-3.8H2.9c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h320.3c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" fill="url(#paint2_linear)"/>
              <defs>
                <linearGradient id="paint0_linear" x1="352.834" y1="333.066" x2="201.539" y2="196.379" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00FFA3"/>
                  <stop offset="1" stopColor="#DC1FFF"/>
                </linearGradient>
                <linearGradient id="paint1_linear" x1="352.834" y1="333.066" x2="201.539" y2="196.379" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00FFA3"/>
                  <stop offset="1" stopColor="#DC1FFF"/>
                </linearGradient>
                <linearGradient id="paint2_linear" x1="352.834" y1="333.066" x2="201.539" y2="196.379" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00FFA3"/>
                  <stop offset="1" stopColor="#DC1FFF"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-[#00FFA3] to-[#DC1FFF] bg-clip-text text-transparent group-hover:from-[#00FFA3] group-hover:to-[#9945FF] transition-colors duration-500">Solana</span>
        </Link>
        
        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full">
          <button 
            onClick={() => setPresentationMode('pitch')} 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${presentationMode === 'pitch' ? 'bg-solana-primary/20 text-solana-primary' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <Presentation size={16} />
            <span>Pitch</span>
            {presentationMode === 'pitch' && <ToggleRight size={16} className="ml-1" />}
          </button>
          <button 
            onClick={() => setPresentationMode('technical')} 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${presentationMode === 'technical' ? 'bg-solana-primary/20 text-solana-primary' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <Cog size={16} />
            <span>Technical</span>
            {presentationMode === 'technical' && <ToggleRight size={16} className="ml-1" />}
          </button>
        </div>
        </div>
        
        <div className="px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full text-sm text-zinc-300">
          Slide {currentSlide + 1} of {totalSlides}
        </div>
      </header>
      
      <main className="flex-1 flex flex-col p-6 md:p-12 relative z-10 slide-container">
        <h1 className="slide-title">
          {slides[currentSlide].title}
        </h1>
        
        <div className={`slide-content ${slides[currentSlide].layoutClass || ''}`}>
          {slides[currentSlide].content}
        </div>
      </main>
      
      <footer className="p-6 flex justify-center items-center gap-6 border-t border-white/10 relative z-10">
        <div className="absolute left-6 text-sm text-zinc-500 font-mono">
          Mode: {presentationMode === 'pitch' ? 'Pitch Deck' : 'Technical Demo'}
        </div>
        <button 
          onClick={prevSlide}
          className="solana-nav-button flex items-center px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-300 shadow-lg text-lg"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Prev
        </button>
        
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-solana-primary scale-125 shadow-lg shadow-[#00FFA3]/20' : 'bg-zinc-600 hover:bg-zinc-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        <button 
          onClick={nextSlide}
          className="solana-nav-button flex items-center px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-300 shadow-lg text-lg"
        >
          Next
          <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </footer>
    </div>
  );
}