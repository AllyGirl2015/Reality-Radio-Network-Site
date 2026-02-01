'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Music, ArrowRight, User } from 'lucide-react';
import { Artist } from '@/lib/database';
import { getImageUrl } from '@/lib/storage';

interface ArtistCardProps {
  artist: Artist;
  albumCount?: number;
  singleCount?: number;
}

const accentColors: Record<string, { border: string; text: string; bg: string; shadow: string; gradient: string }> = {
  purple: {
    border: 'border-purple-500/30 hover:border-purple-400',
    text: 'text-purple-400',
    bg: 'bg-purple-600',
    shadow: 'hover:shadow-purple-500/20',
    gradient: 'from-purple-500/20 to-purple-900/40',
  },
  pink: {
    border: 'border-pink-500/30 hover:border-pink-400',
    text: 'text-pink-400',
    bg: 'bg-pink-600',
    shadow: 'hover:shadow-pink-500/20',
    gradient: 'from-pink-500/20 to-pink-900/40',
  },
  red: {
    border: 'border-red-500/30 hover:border-red-400',
    text: 'text-red-400',
    bg: 'bg-red-600',
    shadow: 'hover:shadow-red-500/20',
    gradient: 'from-red-500/20 to-red-900/40',
  },
  indigo: {
    border: 'border-indigo-500/30 hover:border-indigo-400',
    text: 'text-indigo-400',
    bg: 'bg-indigo-600',
    shadow: 'hover:shadow-indigo-500/20',
    gradient: 'from-indigo-500/20 to-indigo-900/40',
  },
};

export default function ArtistCard({ artist, albumCount = 0, singleCount = 0 }: ArtistCardProps) {
  const colors = accentColors[(artist as any).accentColor ?? (artist as any).accent_color] || accentColors.purple;
  const imageUrl = getImageUrl((artist as any).image ?? (artist as any).image);

  return (
    <Link
      href={`/talent/${artist.slug}`}
      className={`group relative bg-black/40 border ${colors.border} rounded-xl overflow-hidden hover:shadow-2xl ${colors.shadow} transition-all duration-300 block`}
    >
      {/* Background Image */}
      <div className={`relative aspect-[4/3] bg-gradient-to-br ${colors.gradient}`}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={artist.name}
            fill
            className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <User className={`w-24 h-24 ${colors.text} opacity-50`} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <span className={`inline-block px-3 py-1 ${colors.bg}/80 backdrop-blur-sm rounded-full text-xs font-semibold text-white mb-3`}>
          {artist.genre}
        </span>
        
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
          {artist.name}
        </h3>
        
        <p className="text-gray-300 text-sm line-clamp-2 mb-4">
          {artist.bio}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            {albumCount > 0 && (
              <span className="flex items-center gap-1">
                <Music className="w-4 h-4" aria-hidden="true" />
                {albumCount} album{albumCount > 1 ? 's' : ''}
              </span>
            )}
            {singleCount > 0 && (
              <span>{singleCount} single{singleCount > 1 ? 's' : ''}</span>
            )}
          </div>
          <ArrowRight className={`w-5 h-5 ${colors.text} group-hover:translate-x-2 transition-transform`} aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}
