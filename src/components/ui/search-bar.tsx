'use client';

import { useState, KeyboardEvent } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SearchBar({ 
  placeholder = 'Search...', 
  onSearch, 
  className = '',
  size = 'md'
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  
  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-base',
    lg: 'h-12 text-lg'
  };
  
  const handleSearch = () => {
    if (onSearch && query.trim()) {
      onSearch(query.trim());
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className={`
          w-full pl-10 pr-4 py-2 
          rounded-full border border-border
          bg-card/50 backdrop-blur-sm
          focus:border-primary focus:ring-1 focus:ring-primary
          transition-all duration-200
          ${sizeClasses[size]}
        `}
      />
      <button
        onClick={handleSearch}
        className="absolute left-3 text-muted-foreground hover:text-primary transition-colors"
      >
        <Search className={size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'} />
      </button>
    </div>
  );
}
