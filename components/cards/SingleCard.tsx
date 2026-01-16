'use client';

import Link from 'next/link';
import { Play, ShoppingCart, Disc, Clock } from 'lucide-react';
import { Single } from '@/types/database';

interface SingleCardProps {
  single: Single;
  variant?: 'featured' | 'compact';
}

const accentColors: Record<string, { border: string; text: string; bg: string; shadow: string }> = {
  purple: {
    border: 'border-purple-500/30 hover:border-purple-400',
    text: 'text-purple-400',
    bg: 'bg-purple-600',
    shadow: 'hover:shadow-purple-500/20',
  },
  pink: {
    border: 'border-pink-500/30 hover:border-pink-400',
    text: 'text-pink-400',
    bg: 'bg-pink-600',
    shadow: 'hover:shadow-pink-500/20',
  },
  red: {
    border: 'border-red-500/30 hover:border-red-400',
    text: 'text-red-400',
    bg: 'bg-red-600',
    shadow: 'hover:shadow-red-500/20',
  },
  indigo: {
    border: 'border-indigo-500/30 hover:border-indigo-400',
    text: 'text-indigo-400',
    bg: 'bg-indigo-600',
    shadow: 'hover:shadow-indigo-500/20',
  },
};

export default function SingleCard({ single, variant = 'compact' }: SingleCardProps) {
  const colors = accentColors[single.accent_color] || accentColors.purple;

  if (variant === 'featured') {
    return (
      <Link
        href={`/store/singles/${single.slug}`}
        className={`group bg-black/40 border ${colors.border} rounded-lg overflow-hidden hover:shadow-2xl ${colors.shadow} transition-all duration-300 block p-6`}
      >
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 ${colors.bg} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
            <Disc className="w-8 h-8 text-white" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-semibold ${colors.text} uppercase tracking-wider`}>
                Featured
              </span>
              {single.album_title && (
                <span className="text-xs text-gray-500">
                  • From {single.album_title}
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors line-clamp-1">
              {single.title}
            </h3>
            <p className="text-gray-400 text-sm mb-2">{single.artist_name}</p>
            <p className="text-gray-300 text-sm line-clamp-2 mb-3">{single.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  {single.duration}
                </span>
                <span>{single.genre}</span>
              </div>
              <span className={`font-bold ${colors.text}`}>${single.price}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/store/singles/${single.slug}`}
      className={`group bg-black/40 border ${colors.border} rounded-lg overflow-hidden hover:shadow-lg ${colors.shadow} transition-all duration-300 block p-4`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
          <Play className="w-5 h-5 text-white ml-0.5" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
            {single.title}
          </h3>
          <p className="text-sm text-gray-400 line-clamp-1">{single.artist_name}</p>
          {single.album_title && (
            <p className="text-xs text-gray-500 line-clamp-1">From: {single.album_title}</p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-gray-400">{single.duration}</p>
          <p className={`font-bold ${colors.text}`}>${single.price}</p>
        </div>
      </div>
    </Link>
  );
}
