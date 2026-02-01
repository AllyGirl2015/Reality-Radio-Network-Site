// Tracklist Player Component - Compact inline player for album tracklists
'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Loader2, ShoppingCart } from 'lucide-react';

interface Track {
  number: number;
  title: string;
  duration: string;
  featured?: boolean;
  previewUrl?: string;
  purchaseUrl?: string;
}

interface TracklistPlayerProps {
  tracks: Track[];
  artist?: string;
  previewDuration?: number;
  accentColor?: 'purple' | 'pink' | 'red' | 'indigo' | 'yellow';
}

export default function TracklistPlayer({
  tracks,
  artist,
  previewDuration = 15,
  accentColor = 'purple',
}: TracklistPlayerProps) {
  const [currentTrack, setCurrentTrack] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [trackDuration, setTrackDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPreview = previewDuration > 0;

  const colorClasses = {
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-400/30',
      hoverBorder: 'hover:border-purple-400',
      activeBorder: 'border-purple-400',
      text: 'text-purple-400',
      hoverText: 'group-hover:text-purple-300',
      button: 'bg-purple-500 hover:bg-purple-600',
      progressBg: 'bg-purple-500/30',
      progressFill: 'bg-purple-500',
      badge: 'bg-purple-500/20 border-purple-400/30 text-purple-400',
    },
    pink: {
      bg: 'bg-pink-500/10',
      border: 'border-pink-400/30',
      hoverBorder: 'hover:border-pink-400',
      activeBorder: 'border-pink-400',
      text: 'text-pink-400',
      hoverText: 'group-hover:text-pink-300',
      button: 'bg-pink-500 hover:bg-pink-600',
      progressBg: 'bg-pink-500/30',
      progressFill: 'bg-pink-500',
      badge: 'bg-pink-500/20 border-pink-400/30 text-pink-400',
    },
    red: {
      bg: 'bg-red-500/10',
      border: 'border-red-400/30',
      hoverBorder: 'hover:border-red-400',
      activeBorder: 'border-red-400',
      text: 'text-red-400',
      hoverText: 'group-hover:text-red-300',
      button: 'bg-red-500 hover:bg-red-600',
      progressBg: 'bg-red-500/30',
      progressFill: 'bg-red-500',
      badge: 'bg-red-500/20 border-red-400/30 text-red-400',
    },
    indigo: {
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-400/30',
      hoverBorder: 'hover:border-indigo-400',
      activeBorder: 'border-indigo-400',
      text: 'text-indigo-400',
      hoverText: 'group-hover:text-indigo-300',
      button: 'bg-indigo-500 hover:bg-indigo-600',
      progressBg: 'bg-indigo-500/30',
      progressFill: 'bg-indigo-500',
      badge: 'bg-indigo-500/20 border-indigo-400/30 text-indigo-400',
    },
    yellow: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-400/30',
      hoverBorder: 'hover:border-yellow-400',
      activeBorder: 'border-yellow-400',
      text: 'text-yellow-400',
      hoverText: 'group-hover:text-yellow-300',
      button: 'bg-yellow-500 hover:bg-yellow-600',
      progressBg: 'bg-yellow-500/30',
      progressFill: 'bg-yellow-500',
      badge: 'bg-yellow-500/20 border-yellow-400/30 text-yellow-400',
    },
  };

  const colors = colorClasses[accentColor];

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const startProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    progressIntervalRef.current = setInterval(() => {
      if (audioRef.current) {
        const effectiveDuration = isPreview
          ? previewDuration
          : (audioRef.current.duration || trackDuration || 0);
        const currentProgress = effectiveDuration > 0
          ? (audioRef.current.currentTime / effectiveDuration) * 100
          : 0;
        setProgress(currentProgress);

        if (isPreview && audioRef.current.currentTime >= previewDuration) {
          handleStop();
        }
      }
    }, 100);
  };

  const handlePlay = async (trackNumber: number) => {
    const track = tracks.find(t => t.number === trackNumber);
    if (!track?.previewUrl || !audioRef.current) return;

    // If clicking on a different track, switch to it
    if (currentTrack !== trackNumber) {
      audioRef.current.pause();
      audioRef.current.src = track.previewUrl;
      audioRef.current.currentTime = 0;
      setCurrentTrack(trackNumber);
      setProgress(0);
    }

    try {
      setIsLoading(true);
      await audioRef.current.play();
      setIsPlaying(true);
      startProgressTracking();
    } catch (err) {
      console.error('Error playing audio:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setProgress(0);
      setCurrentTrack(null);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
  };

  const handleTogglePlay = (trackNumber: number) => {
    if (currentTrack === trackNumber && isPlaying) {
      handlePause();
    } else {
      handlePlay(trackNumber);
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        preload="none"
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setTrackDuration(audioRef.current.duration || 0);
          }
        }}
        onEnded={handleStop}
        onError={() => {
          setIsLoading(false);
          setIsPlaying(false);
        }}
      />
      
      <div className="max-w-4xl space-y-2">
        {tracks.map((track) => {
          const isCurrentTrack = currentTrack === track.number;
          const isTrackPlaying = isCurrentTrack && isPlaying;
          const isTrackLoading = isCurrentTrack && isLoading;
          const hasPreview = !!track.previewUrl;

          return (
            <div
              key={track.number}
              className={`group relative flex items-center gap-4 p-4 rounded-lg transition-all duration-300 overflow-hidden ${
                track.featured
                  ? `${colors.bg} border ${colors.border} ${colors.hoverBorder}`
                  : `bg-black/40 border border-gray-700/30 hover:bg-black/60 ${colors.hoverBorder}`
              } ${isCurrentTrack ? colors.activeBorder : ''}`}
            >
              {/* Progress bar background */}
              {isCurrentTrack && (
                <div 
                  className={`absolute inset-0 ${colors.progressBg} transition-all duration-100`}
                  style={{ width: `${progress}%` }}
                />
              )}

              <div className="relative flex items-center gap-4 w-full z-10">
                <div className="flex-shrink-0 w-8 text-center">
                  <span className="text-gray-400 font-mono">{track.number}</span>
                </div>

                <div className="flex-shrink-0">
                  {hasPreview ? (
                    <button
                      onClick={() => handleTogglePlay(track.number)}
                      className={`w-10 h-10 rounded-lg ${colors.button} flex items-center justify-center border ${colors.border} ${colors.hoverBorder} transition-all hover:scale-110`}
                      aria-label={isTrackPlaying ? `Pause ${track.title}` : `Play preview of ${track.title}`}
                    >
                      {isTrackLoading ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" aria-hidden="true" />
                      ) : isTrackPlaying ? (
                        <Pause className="w-4 h-4 text-white" aria-hidden="true" />
                      ) : (
                        <Play className="w-4 h-4 text-white ml-0.5" aria-hidden="true" />
                      )}
                    </button>
                  ) : (
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-gray-600/20 to-gray-500/20 flex items-center justify-center border border-gray-600/30`}>
                      <Play className="w-4 h-4 text-gray-500" aria-hidden="true" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-white ${colors.hoverText} transition-colors truncate`}>
                    {track.title}
                    {track.featured && (
                      <span className={`ml-2 text-xs ${colors.badge} border px-2 py-0.5 rounded-full`}>
                        FEATURED
                      </span>
                    )}
                  </h3>
                  {isCurrentTrack && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {isTrackPlaying ? (isPreview ? `Playing ${previewDuration}s preview...` : 'Playing full track...') : 'Paused'}
                    </p>
                  )}
                </div>

                <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3">
                  {track.purchaseUrl && (
                    <a
                      href={track.purchaseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 ${colors.button} text-white text-xs font-semibold rounded-lg transition-all hover:scale-105 border ${colors.border}`}
                      aria-label={`Buy ${track.title}`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" aria-hidden="true" />
                      <span className="hidden sm:inline">$0.99</span>
                    </a>
                  )}
                  {hasPreview && (
                    <span className={`hidden sm:inline-block text-xs px-2 py-1 ${colors.badge} border rounded`}>
                      {isPreview ? `${previewDuration}s` : 'FULL'}
                    </span>
                  )}
                  <span className="text-gray-400 text-sm font-mono">
                    {track.duration}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
