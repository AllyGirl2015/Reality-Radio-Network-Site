'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Menu, X, Radio, ShoppingBag, Users, Music, BookOpen, Mail, BookText, ChevronDown } from 'lucide-react';
import SearchBar from './SearchBar';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navLinks = [
    { href: '/radio', label: 'Radio Stations', icon: Radio },
    { href: '/story', label: 'About', icon: BookOpen },
    { href: '/blog', label: 'Blog', icon: BookText },
    { href: '/contact', label: 'Contact', icon: Mail },
  ];

  const storeLinks = [
    { href: '/store/albums', label: 'Albums', icon: Music },
    { href: '/store/singles', label: 'Singles', icon: Music },
  ];

  const talentsLinks = [
    { href: '/artists', label: 'Artists', icon: Users },
    { href: '/personas', label: 'Persona Adoption Program', icon: Music },
  ];

  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/70 backdrop-blur-md border-b border-purple-500/30' : 'bg-transparent'
      }`}
      role="banner"
    >
      <nav className="container mx-auto px-4 py-4" aria-label="Main navigation">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group" aria-label="Reality Radio Network Home">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12">
              <Image
                src="/RRN_logo.jpg"
                alt="Reality Radio Network"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent hidden sm:block">Reality Radio Network</span>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent sm:hidden">RRN</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-purple-400 transition-colors duration-300 font-medium flex items-center gap-1 whitespace-nowrap"
                aria-label={link.label}
              >
                <link.icon className="w-4 h-4" aria-hidden="true" />
                <span className="hidden xl:inline">{link.label}</span>
              </Link>
            ))}
            
            {/* Store Dropdown */}
            <div 
              className="relative store-dropdown group"
            >
              <Link
                href="/store"
                className="text-gray-300 hover:text-purple-400 transition-colors duration-300 font-medium flex items-center gap-1 whitespace-nowrap"
                aria-label="Store"
              >
                <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                <span>Store</span>
                <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" aria-hidden="true" />
              </Link>
              
              <div 
                className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
              >
                <div className="w-48 bg-black/95 backdrop-blur-md border border-purple-500/30 rounded-lg shadow-2xl shadow-purple-500/30 py-2">
                  {storeLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-4 py-3 text-gray-300 hover:text-purple-400 hover:bg-purple-500/10 transition-colors duration-300 font-medium flex items-center gap-2"
                      aria-label={link.label}
                    >
                      <link.icon className="w-4 h-4" aria-hidden="true" />
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Talents Dropdown */}
            <div 
              className="relative talents-dropdown group"
            >
              <Link
                href="/artists"
                className="text-gray-300 hover:text-purple-400 transition-colors duration-300 font-medium flex items-center gap-1 whitespace-nowrap"
                aria-label="Talents"
              >
                <Users className="w-4 h-4" aria-hidden="true" />
                <span>Talents</span>
                <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" aria-hidden="true" />
              </Link>
              
              <div 
                className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
              >
                <div className="w-60 bg-black/95 backdrop-blur-md border border-purple-500/30 rounded-lg shadow-2xl shadow-purple-500/30 py-2">
                  {talentsLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-4 py-3 text-gray-300 hover:text-purple-400 hover:bg-purple-500/10 transition-colors duration-300 font-medium flex items-center gap-2"
                      aria-label={link.label}
                    >
                      <link.icon className="w-4 h-4" aria-hidden="true" />
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-shrink-0">
              <SearchBar />
            </div>

            {/* Listen Now Button */}
            <Link
              href="https://live365.com/station/201-5-Reality-Central-Radio-a47993"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-neon flex items-center gap-2 text-sm px-4 py-2 whitespace-nowrap flex-shrink-0"
              aria-label="Listen to 201.5 Reality Central Radio"
            >
              <Radio className="w-4 h-4" aria-hidden="true" />
              <span className="hidden xl:inline">Listen to 201.5 RCR</span>
              <span className="xl:hidden">201.5 RCR</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
          </button>
        </div>
      </nav>
    </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />
            
            {/* Menu Sidebar */}
            <div 
              id="mobile-menu"
              className="fixed top-0 right-0 h-full w-[80%] bg-black/95 backdrop-blur-xl border-l border-purple-500/30 z-50 lg:hidden overflow-y-auto animate-in slide-in-from-right duration-300 shadow-2xl shadow-purple-500/20"
              role="menu"
            >
              {/* Header do Menu */}
              <div className="flex items-center justify-between p-4 border-b border-purple-500/20">
                <div className="flex items-center space-x-2">
                  <div className="relative w-8 h-8">
                    <Image
                      src="/RRN_logo.jpg"
                      alt="RRN"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Menu</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" aria-hidden="true" />
                </button>
              </div>
            <div className="flex flex-col space-y-2 p-4">
              {/* Search Bar Mobile */}
              <div className="px-2 py-2">
                <SearchBar />
              </div>

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-300 hover:text-purple-400 transition-colors duration-300 font-medium flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-purple-500/10 active:bg-purple-500/20"
                  role="menuitem"
                  aria-label={link.label}
                >
                  <link.icon className="w-5 h-5" aria-hidden="true" />
                  <span className="text-base">{link.label}</span>
                </Link>
              ))}
              
              {/* Store Section Mobile */}
              <div className="border-t border-purple-500/20 pt-2 mt-1">
                <div className="px-2 py-2">
                  <div className="text-purple-400 font-semibold text-xs uppercase tracking-wide mb-2 px-2">Store</div>
                  {storeLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-gray-300 hover:text-purple-400 transition-colors duration-300 font-medium flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-purple-500/10 active:bg-purple-500/20"
                      role="menuitem"
                      aria-label={link.label}
                    >
                      <link.icon className="w-5 h-5" aria-hidden="true" />
                      <span className="text-base">{link.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Talents Section Mobile */}
              <div className="border-t border-purple-500/20 pt-2 mt-1">
                <div className="px-2 py-2">
                  <div className="text-purple-400 font-semibold text-xs uppercase tracking-wide mb-2 px-2">Talents</div>
                  {talentsLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-gray-300 hover:text-purple-400 transition-colors duration-300 font-medium flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-purple-500/10 active:bg-purple-500/20"
                      role="menuitem"
                      aria-label={link.label}
                    >
                      <link.icon className="w-5 h-5" aria-hidden="true" />
                      <span className="text-base">{link.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Listen Now Mobile */}
              <div className="border-t border-purple-500/20 pt-3 mt-2 px-2">
                <Link
                  href="https://live365.com/station/201-5-Reality-Central-Radio-a47993"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn-neon w-full flex items-center justify-center gap-2 py-3"
                  aria-label="Listen to 201.5 Reality Central Radio"
                >
                  <Radio className="w-5 h-5" aria-hidden="true" />
                  Listen to 201.5 RCR
                </Link>
              </div>
            </div>
          </div>
          </>
        )}
    </>
  );
}
