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

  // Complete data for search
  const allData: SearchResult[] = [
    // Albums
    { id: 'a1', title: "America's Changed", subtitle: 'Johnathan Gold', type: 'album', href: '/store/albums/americas-changed' },
    { id: 'a2', title: 'Heartfelt Rebellion', subtitle: 'Johnathan Gold', type: 'album', href: '/store/albums/heartfelt-rebellion' },
    { id: 'a3', title: 'Golden Heartbreak', subtitle: 'Johnathan Gold', type: 'album', href: '/store/albums/golden-heartbreak' },
    { id: 'a4', title: 'Shattered Peaces', subtitle: 'Mathew Cage', type: 'album', href: '/store/albums/shattered-peaces' },
    { id: 'a5', title: 'High Hit', subtitle: 'Mathew Cage', type: 'album', href: '/store/albums/high-hit' },
    { id: 'a6', title: 'Barefoot Supernova', subtitle: 'Kaira Heartfelt', type: 'album', href: '/store/albums/barefoot-supernova' },
    { id: 'a7', title: 'Stellar Love', subtitle: 'Kaira Heartfelt', type: 'album', href: '/store/albums/stellar-love' },
    { id: 'a8', title: 'Descend', subtitle: 'Chronix', type: 'album', href: '/store/albums/decend' },
    
    // Singles - Johnathan Gold
    { id: 's1', title: "America's Changed", subtitle: 'Johnathan Gold', type: 'single', href: '/store/singles/americas-changed' },
    { id: 's2', title: 'Goodbye Mainstreet', subtitle: 'Johnathan Gold', type: 'single', href: '/store/singles/goodbye-mainstreet' },
    { id: 's3', title: 'She Wore Red, I Wore Blue', subtitle: 'Johnathan Gold', type: 'single', href: '/store/singles/she-wore-red-i-wore-blue' },
    { id: 's4', title: 'God Blessed the Silent Ones', subtitle: 'Johnathan Gold', type: 'single', href: '/store/singles/god-blessed-the-silent-ones' },
    { id: 's5', title: 'Gas Station Prayers', subtitle: 'Johnathan Gold', type: 'single', href: '/store/singles/gas-station-prayers' },
    { id: 's6', title: 'Heartfelt Rebellion', subtitle: 'Johnathan Gold', type: 'single', href: '/store/singles/heartfelt-rebellion' },
    { id: 's7', title: 'Country Bonfire', subtitle: 'Johnathan Gold', type: 'single', href: '/store/singles/country-bonfire' },
    { id: 's8', title: 'Screens', subtitle: 'Johnathan Gold', type: 'single', href: '/store/singles/screens' },
    { id: 's9', title: 'Forgotten Sons', subtitle: 'Johnathan Gold', type: 'single', href: '/store/singles/forgotten-sons' },
    { id: 's10', title: 'Chaos Country', subtitle: 'Johnathan Gold', type: 'single', href: '/store/singles/chaos-country' },
    { id: 's11', title: 'Back When We Fell', subtitle: 'Johnathan Gold', type: 'single', href: '/store/singles/back-when-we-fell' },
    { id: 's12', title: 'City Girl', subtitle: 'Johnathan Gold', type: 'single', href: '/store/singles/city-girl' },
    { id: 's13', title: 'Country Looks', subtitle: 'Johnathan Gold', type: 'single', href: '/store/singles/country-looks' },
    { id: 's14', title: 'Tractor Heart', subtitle: 'Johnathan Gold', type: 'single', href: '/store/singles/tractor-heart' },
    { id: 's15', title: "Country Lovin'", subtitle: 'Johnathan Gold', type: 'single', href: '/store/singles/country-lovin' },
    
    // Singles - Kaira Heartfelt
    { id: 's16', title: 'Small Town Supernova', subtitle: 'Kaira Heartfelt', type: 'single', href: '/store/singles/small-town-supernova' },
    { id: 's17', title: 'Country Girl', subtitle: 'Kaira Heartfelt', type: 'single', href: '/store/singles/country-girl' },
    { id: 's18', title: 'Barefoot Change', subtitle: 'Kaira Heartfelt', type: 'single', href: '/store/singles/barefoot-change' },
    { id: 's19', title: 'Lovestruck', subtitle: 'Kaira Heartfelt', type: 'single', href: '/store/singles/lovestruck' },
    { id: 's20', title: 'Evil Love', subtitle: 'Kaira Heartfelt', type: 'single', href: '/store/singles/evil-love' },
    { id: 's21', title: 'Lustful Love', subtitle: 'Kaira Heartfelt', type: 'single', href: '/store/singles/lustful-love' },
    { id: 's22', title: 'Love Killer', subtitle: 'Kaira Heartfelt', type: 'single', href: '/store/singles/love-killer' },
    { id: 's23', title: 'The Stars Above', subtitle: 'Kaira Heartfelt', type: 'single', href: '/store/singles/the-stars-above' },
    { id: 's24', title: 'Take My Love', subtitle: 'Kaira Heartfelt', type: 'single', href: '/store/singles/take-my-love' },
    
    // Singles - Mathew Cage
    { id: 's25', title: 'World of Gold', subtitle: 'Mathew Cage', type: 'single', href: '/store/singles/world-of-gold' },
    { id: 's26', title: 'Fractured Signal', subtitle: 'Mathew Cage', type: 'single', href: '/store/singles/fractured-signal' },
    { id: 's27', title: 'The Line Was Crossed', subtitle: 'Mathew Cage', type: 'single', href: '/store/singles/the-line-was-crossed' },
    { id: 's28', title: 'Echoes of the Cage', subtitle: 'Mathew Cage', type: 'single', href: '/store/singles/echoes-of-the-cage' },
    { id: 's29', title: 'Fallen Flag', subtitle: 'Mathew Cage', type: 'single', href: '/store/singles/fallen-flag' },
    { id: 's30', title: 'Scraps', subtitle: 'Mathew Cage', type: 'single', href: '/store/singles/scraps' },
    { id: 's31', title: 'One Drink', subtitle: 'Mathew Cage', type: 'single', href: '/store/singles/one-drink' },
    { id: 's32', title: 'Fallen Dust', subtitle: 'Mathew Cage', type: 'single', href: '/store/singles/fallen-dust' },
    { id: 's33', title: 'Drown it Out', subtitle: 'Mathew Cage', type: 'single', href: '/store/singles/drown-it-out' },
    { id: 's34', title: 'Chronicles', subtitle: 'Mathew Cage', type: 'single', href: '/store/singles/chronicles' },
    
    // Singles - Chronix
    { id: 's35', title: 'Starting Line', subtitle: 'Chronix', type: 'single', href: '/store/singles/starting-line' },
    { id: 's36', title: 'Power of the Few', subtitle: 'Chronix', type: 'single', href: '/store/singles/power-of-the-few' },
    { id: 's37', title: 'Rags No More', subtitle: 'Chronix', type: 'single', href: '/store/singles/rags-no-more' },
    { id: 's38', title: 'Hate No More', subtitle: 'Chronix', type: 'single', href: '/store/singles/hate-no-more' },
    { id: 's39', title: 'Mark Me Down', subtitle: 'Chronix', type: 'single', href: '/store/singles/mark-me-down' },
    
    // Artists
    { id: 'ar1', title: 'Johnathan Gold & Guilded Hearts', subtitle: 'Country / Americana', type: 'artist', href: '/talent/johnathan-gold' },
    { id: 'ar2', title: 'Mathew Cage', subtitle: 'Alt Rock / Emotional Rock', type: 'artist', href: '/talent/mathew-cage' },
    { id: 'ar3', title: 'Kaira Heartfelt', subtitle: 'Country-Pop', type: 'artist', href: '/talent/kaira-heartfelt' },
    { id: 'ar4', title: 'Chronix', subtitle: 'Electronic / Dark Ambient', type: 'artist', href: '/talent/chronix', image: '/Chronix.svg' },
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
        className="w-full lg:w-auto flex items-center justify-center p-2 bg-black/50 hover:bg-black/70 border border-purple-500/30 hover:border-purple-400 rounded-lg transition-all"
        aria-label="Search"
      >
        <Search className="w-5 h-5 text-gray-400 hover:text-purple-400 transition-colors" />
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
