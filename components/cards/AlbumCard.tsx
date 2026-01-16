'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Music, ArrowRight } from 'lucide-react';
import { Album } from '@/types/database';
import { getImageUrl } from '@/lib/storage';

interface AlbumCardProps {
  album: Album;
  variant?: 'default' | 'compact';
}

const accentColors: Record<string, { border: string; text: string; bg: string; shadow: string }> = {
  purple: {
    border: 'border-purple-500/30 hover:border-purple-400',
    text: 'text-purple-400',
    bg: 'bg-purple-500/20',
    shadow: 'hover:shadow-purple-500/20',
  },
  pink: {
    border: 'border-pink-500/30 hover:border-pink-400',
    text: 'text-pink-400',
    bg: 'bg-pink-500/20',
    shadow: 'hover:shadow-pink-500/20',
  },
  red: {
    border: 'border-red-500/30 hover:border-red-400',
    text: 'text-red-400',
    bg: 'bg-red-500/20',
    shadow: 'hover:shadow-red-500/20',
  },
  indigo: {
    border: 'border-indigo-500/30 hover:border-indigo-400',
    text: 'text-indigo-400',
    bg: 'bg-indigo-500/20',
    shadow: 'hover:shadow-indigo-500/20',
  },
};

export default function AlbumCard({ album, variant = 'default' }: AlbumCardProps) {
  const colors = accentColors[album.accent_color] || accentColors.purple;

  if (variant === 'compact') {
    return (
      <Link
        href={`/store/albums/${album.slug}`}
        className={`group bg-black/40 border ${colors.border} rounded-lg overflow-hidden hover:shadow-2xl ${colors.shadow} transition-all duration-300 block`}
      >
        <div className="relative aspect-square">
          <Image
            src={getImageUrl(album.image)}
            alt={`${album.title} album cover`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{album.title}</h3>
            <p className="text-sm text-gray-300 line-clamp-1">{album.artist_name}</p>
            <p className={`text-sm ${colors.text} mt-2`}>${album.digital_price}</p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/store/albums/${album.slug}`}
      className={`group bg-black/40 border ${colors.border} rounded-lg overflow-hidden hover:shadow-2xl ${colors.shadow} transition-all duration-300 block`}
    >
      <div className="flex flex-col md:flex-row">
        {/* Album Cover */}
        <div className="relative w-full md:w-64 h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex-shrink-0">
          <Image
            src={getImageUrl(album.image)}
            alt={`${album.title} album cover`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className={`${colors.bg} backdrop-blur-sm px-6 py-3 rounded-full font-bold text-white flex items-center gap-2`}>
              <ShoppingCart className="w-5 h-5" aria-hidden="true" />
              View Details
            </div>
          </div>
        </div>

        {/* Album Info */}
        <div className="p-6 flex-1 flex flex-col">
          <div className="mb-2">
            <span className={`inline-block px-3 py-1 ${colors.bg} border ${colors.border} rounded-full text-xs font-semibold ${colors.text} mb-3`}>
              {album.year} • {album.genre}
            </span>
          </div>

          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent group-hover:from-purple-400 group-hover:to-pink-400 transition-all">
            {album.title}
          </h2>
          
          <p className="text-gray-400 mb-4">{album.artist_name}</p>

          <p className="text-gray-300 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
            {album.description}
          </p>

          <div className="flex items-center gap-6 text-sm text-gray-400 mb-4">
            <span className="flex items-center gap-1">
              <Music className="w-4 h-4" aria-hidden="true" />
              {album.duration}
            </span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-purple-500/20">
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-gray-400 mb-1">Digital</p>
                <p className={`text-lg font-bold ${colors.text}`}>${album.digital_price}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Physical CD</p>
                <p className="text-lg font-bold text-cyan-400">${album.physical_price}</p>
              </div>
            </div>
            
            <ArrowRight className={`w-6 h-6 ${colors.text} group-hover:translate-x-2 transition-transform`} aria-hidden="true" />
          </div>
        </div>
      </div>
    </Link>
  );
}
