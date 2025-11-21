'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Music2, Disc, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'album' | 'single' | 'artist';
  href: string;
  image?: string;
}

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filters, setFilters] = useState({
    albums: true,
    singles: true,
    artists: true,
  });
  const searchRef = useRef<HTMLDivElement>(null);

  // Mock data - replace with your actual data
  const allData: SearchResult[] = [
    // Albums
    { id: '1', title: "America's Changed", subtitle: 'Johnathan Gold', type: 'album', href: '/store/albums/americas-changed', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200&h=200&fit=crop' },
    { id: '2', title: 'Heartfelt Rebellion', subtitle: 'Johnathan Gold', type: 'album', href: '/store/albums/heartfelt-rebellion', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop' },
    { id: '3', title: 'Shattered Peaces', subtitle: 'Mathew Cage', type: 'album', href: '/store/albums/shattered-peaces', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop' },
    { id: '4', title: 'Barefoot Supernova', subtitle: 'Kaira Heartfelt', type: 'album', href: '/store/albums/barefoot-supernova', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=200&h=200&fit=crop' },
    { id: '14', title: 'Descend', subtitle: 'Chronix', type: 'album', href: '/store/albums/descend', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop' },
    
    // Singles
    { id: '5', title: 'Chaos Country', subtitle: 'Johnathan Gold', type: 'single', href: '/store/singles/chaos-country', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop' },
    { id: '6', title: "America's Changed", subtitle: 'Johnathan Gold', type: 'single', href: '/store/singles/americas-changed', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200&h=200&fit=crop' },
    { id: '7', title: 'Heartfelt Rebellion', subtitle: 'Johnathan Gold', type: 'single', href: '/store/singles/heartfelt-rebellion', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop' },
    { id: '8', title: 'World of Gold', subtitle: 'Mathew Cage', type: 'single', href: '/store/singles/world-of-gold', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop' },
    { id: '9', title: 'Fallen Flag', subtitle: 'Mathew Cage', type: 'single', href: '/store/singles/fallen-flag', image: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=200&h=200&fit=crop' },
    { id: '10', title: 'Evil Love', subtitle: 'Kaira Heartfelt', type: 'single', href: '/store/singles/evil-love', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=200&h=200&fit=crop' },
    
    // Artists
    { id: '11', title: 'Johnathan Gold & Guilded Hearts', subtitle: 'Country / Americana', type: 'artist', href: '/talent/johnathan-gold', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop' },
    { id: '12', title: 'Mathew Cage', subtitle: 'Alt Rock / Emotional Rock', type: 'artist', href: '/talent/mathew-cage', image: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=200&h=200&fit=crop' },
    { id: '13', title: 'Kaira Heartfelt', subtitle: 'Country-Pop', type: 'artist', href: '/talent/kaira-heartfelt', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop' },
    { id: '15', title: 'Chronix', subtitle: 'Electronic / Synthwave', type: 'artist', href: '/talent/chronix', image: '/Chronix.svg' },
  ];

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filter and search
  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const filtered = allData.filter((item) => {
      // Check if type is enabled
      if (item.type === 'album' && !filters.albums) return false;
      if (item.type === 'single' && !filters.singles) return false;
      if (item.type === 'artist' && !filters.artists) return false;

      // Search in title and subtitle
      const searchTerm = query.toLowerCase();
      return (
        item.title.toLowerCase().includes(searchTerm) ||
        item.subtitle.toLowerCase().includes(searchTerm)
      );
    });

    setResults(filtered.slice(0, 10)); // Limit to 10 results
  }, [query, filters]);

  const toggleFilter = (filterName: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [filterName]: !prev[filterName] }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'album':
        return <Disc className="w-4 h-4" />;
      case 'single':
        return <Music2 className="w-4 h-4" />;
      case 'artist':
        return <User className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'album':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'single':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'artist':
        return 'bg-pink-500/10 text-pink-400 border-pink-500/30';
      default:
        return '';
    }
  };

  return (
    <div ref={searchRef} className="relative w-full lg:w-auto">
      {/* Search Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full lg:w-auto flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/70 border border-purple-500/30 hover:border-purple-400 rounded-lg transition-all justify-center lg:justify-start"
      >
        <Search className="w-5 h-5 text-gray-400" />
        <span className="text-gray-400 text-sm">Search...</span>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="absolute left-0 lg:right-0 lg:left-auto top-full mt-2 w-full lg:w-[500px] bg-black/95 backdrop-blur-xl border border-purple-500/30 rounded-lg shadow-2xl shadow-purple-500/20 z-50">
          {/* Search Input */}
          <div className="p-4 border-b border-purple-500/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search albums, singles, artists..."
                className="w-full pl-10 pr-10 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 transition-colors"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-purple-500/20">
            <div className="flex flex-wrap gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.albums}
                  onChange={() => toggleFilter('albums')}
                  className="w-4 h-4 accent-cyan-500"
                />
                <span className="text-sm text-gray-300">Albums</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.singles}
                  onChange={() => toggleFilter('singles')}
                  className="w-4 h-4 accent-purple-500"
                />
                <span className="text-sm text-gray-300">Singles</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.artists}
                  onChange={() => toggleFilter('artists')}
                  className="w-4 h-4 accent-pink-500"
                />
                <span className="text-sm text-gray-300">Artists</span>
              </label>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {query.trim() === '' ? (
              <div className="p-8 text-center text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Start typing to search</p>
              </div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No results found</p>
              </div>
            ) : (
              <div className="divide-y divide-purple-500/10">
                {results.map((result) => (
                  <Link
                    key={result.id}
                    href={result.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 p-4 hover:bg-purple-500/10 transition-colors group"
                  >
                    {/* Image */}
                    <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                      {result.image ? (
                        <Image
                          src={result.image}
                          alt={result.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {getTypeIcon(result.type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold truncate group-hover:text-purple-300 transition-colors">
                        {result.title}
                      </h4>
                      <p className="text-sm text-gray-400 truncate">{result.subtitle}</p>
                    </div>

                    {/* Type Badge */}
                    <div className={`flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium flex-shrink-0 ${getTypeBadgeColor(result.type)}`}>
                      {getTypeIcon(result.type)}
                      <span className="capitalize hidden sm:inline">{result.type}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {results.length > 0 && (
            <div className="p-3 border-t border-purple-500/20 text-center text-xs text-gray-500">
              Showing {results.length} result{results.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
