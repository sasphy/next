import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Music, 
  Sparkles, 
  TrendingUp, 
  Disc, 
  ChevronRight
} from 'lucide-react';
import { useWalletAuth } from '@/hooks/use-wallet-auth';

const FiestaHero: React.FC = () => {
  // Track component mount state for hydration safety
  const [mounted, setMounted] = useState(false);
  
  // Get wallet auth with fallback for when it's not initialized
  const walletAuth = useWalletAuth();
  const { isWalletConnected, isAuthenticated, signIn } = walletAuth || {
    isWalletConnected: false,
    isAuthenticated: false,
    signIn: () => Promise.resolve(false)
  };
  
  // Set mounted after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="fiesta-hero relative pt-16 pb-20 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/0 to-background z-10" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_50%)]" />
        <motion.div 
          className="absolute -top-[500px] -left-[500px] w-[1000px] h-[1000px] rounded-full bg-primary/10 blur-3xl"
          animate={{ 
            x: [0, 200, 0], 
            y: [0, 150, 0] 
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute -bottom-[300px] -right-[300px] w-[800px] h-[800px] rounded-full bg-primary/10 blur-3xl"
          animate={{ 
            x: [0, -100, 0], 
            y: [0, -100, 0] 
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
      </div>
    
      <div className="w-full px-4">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div 
            className="mb-6 inline-block"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> 
              <span>Introducing Sasphy Fiesta</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <span className="solana-gradient block">Music NFTs with</span>
            <span className="block">Bonding Curves</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-foreground/80 mb-10 mx-auto max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            Discover, invest, and trade music tokens with bonding curve economics. Be an early supporter of artists and earn returns as their music grows in popularity.
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <Link 
              href="/token/explore" 
              className="solana-button flex items-center justify-center gap-2 group relative overflow-hidden px-6 py-3"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Disc className="h-5 w-5" />
                Explore Tokens
              </span>
              <motion.span 
                className="absolute inset-0 z-0 bg-gradient-to-r from-primary/80 to-purple-600/80"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </Link>
            
            <Link 
              href="/token/create" 
              className="button-outline flex items-center justify-center gap-2 relative overflow-hidden px-6 py-3"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Music className="h-5 w-5" />
                Create Token
              </span>
              <motion.span 
                className="absolute inset-0 z-0 bg-primary/10"
                initial={{ y: "-100%" }}
                whileHover={{ y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </Link>
          </motion.div>

          {/* Key features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {[
              {
                icon: <Disc className="h-6 w-6 text-primary" />,
                title: "Tokenize Your Music",
                description: "Create bonding curve tokens for your music that appreciate in value as they gain popularity."
              },
              {
                icon: <TrendingUp className="h-6 w-6 text-primary" />,
                title: "Dynamic Pricing",
                description: "Price automatically adjusts based on demand, creating a liquid market for music assets."
              },
              {
                icon: <Sparkles className="h-6 w-6 text-primary" />,
                title: "Early Supporter Rewards",
                description: "Early supporters benefit from price appreciation as more tokens are minted."
              }
            ].map((feature, index) => (
              <motion.div 
                key={index} 
                className="feature-card bg-card/30 backdrop-blur-sm p-6 rounded-xl border border-border/40"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              >
                <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FiestaHero; 