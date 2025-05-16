'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import WalletConnectButton from './wallet/wallet-connect-button';
import { useWalletAuth } from '@/hooks/use-wallet-auth';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Search, Menu, X, Music, Home, User, Headphones, Award, Library, Disc, Heart, Upload, Plus } from 'lucide-react';

export default function MainNavigation() {
  const pathname = usePathname();
  const { isWalletConnected, isAuthenticated, signIn, signOut } = useWalletAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  // Track if component is mounted for client-side rendering
  const [mounted, setMounted] = useState(false);
  
  // Set mounted to true once component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Define navigation links
  const navLinks = [
    { href: '/', label: 'Home', icon: Home, isActive: pathname === '/' },
    { href: '/discover', label: 'Discover', icon: Music, isActive: pathname === '/discover' },
    { href: '/tracks', label: 'Explore', icon: Headphones, isActive: pathname === '/tracks' || pathname.startsWith('/tracks/') },
    { href: '/artists', label: 'Artists', icon: Disc, isActive: pathname === '/artists' || pathname.startsWith('/artists/') },
    { href: '/library', label: 'My Library', icon: Library, isActive: pathname === '/library' },
    { href: '/leaderboard', label: 'Influence', icon: Award, isActive: pathname === '/leaderboard' },
    { href: '/create', label: 'Create', icon: Upload, isActive: pathname === '/create', isPrimary: true }
  ];
  
  // Update the active status of each link based on the current pathname
  const updatedNavLinks = React.useMemo(() => {
    return navLinks.map((link) => ({
      ...link,
      isActive: pathname === link.href || 
                (pathname?.startsWith(link.href) && link.href !== "/"),
    }));
  }, [navLinks, pathname]);

  return (
    <nav className="bg-background/80 backdrop-blur-lg">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
            <Image src="/logo.svg" className="invert mr-2" alt="Sasphy Logo" width={32} height={32} />
              <span className="text-2xl font-display font-bold text-white">
                sasphy
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 ml-6">
            {updatedNavLinks.map((link) => {
              if (link.isPrimary) return null; // Don't render primary links here
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={cn(
                    "nav-link hover:nav-link-hover",
                    link.isActive && "active"
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <link.icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </span>
                </Link>
              );
            })}
          </div>
          
          {/* Desktop Auth and Search */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search toggle */}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-full hover:bg-primary/10 focus:outline-none transition-colors"
              aria-label="Toggle search"
            >
              <Search className="h-5 w-5 text-foreground" />
            </button>
            
            {/* Search input (conditionally rendered) */}
            {isSearchOpen && (
              <div className="relative animation-fadeIn">
                <input 
                  type="text" 
                  placeholder="Search tracks, artists..." 
                  className="search-input py-1.5 pl-9 pr-3 text-sm w-56"
                  autoFocus
                  onBlur={() => setIsSearchOpen(false)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            )}
            
            {mounted && isWalletConnected ? (
              <div className="flex items-center gap-2">
                {isAuthenticated ? (
                  <button 
                    onClick={signOut}
                    className="button-outline py-1.5 px-3 text-sm"
                  >
                    Sign Out
                  </button>
                ) : (
                  <button 
                    onClick={signIn}
                    className="button-outline py-1.5 px-3 text-sm"
                  >
                    Sign In
                  </button>
                )}
                <WalletConnectButton />
              </div>
            ) : (
              <WalletConnectButton />
            )}
            
            {/* Create button */}
            {updatedNavLinks.find(link => link.isPrimary) && (
              <Link 
                href="/create" 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-1.5 px-4 rounded-lg font-medium flex items-center gap-1.5 ml-3 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create
              </Link>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-foreground hover:bg-primary/10 focus:outline-none transition-colors"
              aria-label="Open menu"
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
        <div className="md:hidden border-t border-border bg-background/90 backdrop-blur-md">
          <div className="w-full px-4 py-3 space-y-1">
            {/* Mobile search */}
            <div className="relative mb-4">
              <input 
                type="text" 
                placeholder="Search tracks, artists..." 
                className="search-input w-full py-2 pl-9 pr-3"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            
            {/* Mobile navigation links */}
            {updatedNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block px-3 py-2.5 rounded-lg text-base font-medium flex items-center",
                  link.isPrimary 
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white" :
                  link.isActive 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-primary/5 hover:text-foreground"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <link.icon className="h-5 w-5 mr-3" />
                {link.label}
              </Link>
            ))}
            
            {/* Mobile wallet buttons */}
            <div className="pt-4 pb-2 border-t border-border mt-4">
              {mounted && isWalletConnected ? (
                <div className="space-y-3">
                  {isAuthenticated ? (
                    <button 
                      onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="button-outline w-full py-2.5"
                    >
                      Sign Out
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        signIn();
                        setIsMobileMenuOpen(false);
                      }}
                      className="button-outline w-full py-2.5"
                    >
                      Sign In
                    </button>
                  )}
                  <WalletConnectButton />
                </div>
              ) : (
                <WalletConnectButton />
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
