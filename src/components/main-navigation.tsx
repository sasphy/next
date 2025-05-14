'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWalletAuth } from '@/hooks/use-wallet-auth';
import { cn } from '@/lib/utils';
import { Search, Menu, X, Music, Home, User, Headphones, Award } from 'lucide-react';

export default function MainNavigation() {
  const pathname = usePathname();
  const { isWalletConnected, isAuthenticated, signIn, signOut } = useWalletAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Define navigation links
  const navLinks = [
    { href: '/', label: 'Home', icon: Home, isActive: pathname === '/' },
    { href: '/discover', label: 'Discover', icon: Music, isActive: pathname === '/discover' },
    { href: '/tracks', label: 'All Tracks', icon: Headphones, isActive: pathname === '/tracks' || pathname.startsWith('/tracks/') },
    { href: '/leaderboard', label: 'Leaderboard', icon: Award, isActive: pathname === '/leaderboard' },
    { href: '/profile', label: 'Profile', icon: User, isActive: pathname === '/profile' }
  ];
  
  return (
    <nav className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-display font-bold solana-gradient">
                SolBeat
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "nav-link",
                  link.isActive && "active"
                )}
              >
                <span className="flex items-center gap-1.5">
                  <link.icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </span>
              </Link>
            ))}
          </div>
          
          {/* Desktop Auth and Search */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search tracks..." 
                className="search-input py-1 pl-9 pr-3 text-sm"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            
            {isWalletConnected ? (
              <>
                {isAuthenticated ? (
                  <button 
                    onClick={signOut}
                    className="button-outline py-1 px-3 text-sm"
                  >
                    Sign Out
                  </button>
                ) : (
                  <button 
                    onClick={signIn}
                    className="button-outline py-1 px-3 text-sm"
                  >
                    Sign In
                  </button>
                )}
                <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !text-primary-foreground !py-1 !h-auto !min-w-0 !rounded-lg !font-medium !transition-colors" />
              </>
            ) : (
              <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !text-primary-foreground !py-1 !h-auto !min-w-0 !rounded-lg !font-medium !transition-colors" />
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-accent-foreground hover:bg-accent focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium flex items-center",
                  link.isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <link.icon className="h-5 w-5 mr-2" />
                {link.label}
              </Link>
            ))}
            
            <div className="relative mt-3 px-3">
              <input 
                type="text" 
                placeholder="Search tracks..." 
                className="search-input w-full py-2 pl-9 pr-3"
              />
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            
            <div className="px-3 py-2">
              {isWalletConnected ? (
                <>
                  {isAuthenticated ? (
                    <button 
                      onClick={signOut}
                      className="button-outline w-full mb-2"
                    >
                      Sign Out
                    </button>
                  ) : (
                    <button 
                      onClick={signIn}
                      className="button-outline w-full mb-2"
                    >
                      Sign In
                    </button>
                  )}
                  <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !text-primary-foreground !py-2 !h-auto !w-full !rounded-lg !font-medium !transition-colors" />
                </>
              ) : (
                <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !text-primary-foreground !py-2 !h-auto !w-full !rounded-lg !font-medium !transition-colors" />
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
