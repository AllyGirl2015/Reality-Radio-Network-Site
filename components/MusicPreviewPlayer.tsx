// Music Preview Player Component with Supabase Storage
'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { trackMusicPreview } from '@/lib/analytics';

interface MusicPreviewPlayerProps {
  trackTitle: string;
  artist: string;
  previewUrl?: string; // Supabase storage URL
  albumArt?: string;
  duration?: number; // Preview duration in seconds (default 30s)
}

export default function MusicPreviewPlayer({
  trackTitle,
  artist,
  previewUrl,
  albumArt,
  duration = 30,
}: MusicPreviewPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackDuration, setTrackDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    // Cleanup on unmount
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
        setCurrentTime(audioRef.current.currentTime);
        
        // Auto-stop after preview duration
        if (duration > 0 && audioRef.current.currentTime >= duration) {
          handleStop();
        }
      }
    }, 100);
  };

  const handlePlay = async () => {
    if (!previewUrl) {
      setError('Preview not available');
      return;
    }

    if (!audioRef.current) return;

    try {
      setIsLoading(true);
      setError(null);
      
      await audioRef.current.play();
      setIsPlaying(true);
      startProgressTracking();
      
      // Track analytics
      trackMusicPreview(trackTitle, artist);
    } catch (err) {
      console.error('Error playing audio:', err);
      setError('Failed to play preview');
      setIsPlaying(false);
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
      setCurrentTime(0);
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
        audioRef.current.muted = false;
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const effectiveDuration = duration > 0 ? duration : trackDuration;
  const progress = effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;

  if (!previewUrl) {
    return (
      <div className="bg-black/40 border border-gray-600/30 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-500">Preview not available</p>
      </div>
    );
  }

  return (
    <div className="bg-black/40 border border-purple-500/30 rounded-lg p-4 hover:border-purple-400 transition-colors">
      <audio
        ref={audioRef}
        src={previewUrl}
        preload="metadata"
        onEnded={handleStop}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setTrackDuration(audioRef.current.duration || 0);
          }
        }}
        onError={() => setError('Failed to load preview')}
      />

      {/* Track Info */}
      <div className="flex items-center gap-3 mb-4">
        {albumArt && (
          <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-500/20 to-cyan-500/20">
            <img src={albumArt} alt={trackTitle} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white truncate">{trackTitle}</h4>
          <p className="text-xs text-gray-400 truncate">{artist}</p>
        </div>
        <div className="text-xs text-gray-500 flex-shrink-0">
          <span className="inline-block px-2 py-1 bg-purple-500/20 rounded text-purple-400 border border-purple-400/30">
            {duration > 0 ? `${duration}s Preview` : 'Full Track'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-3">
        {/* Progress Bar */}
        <div className="space-y-1">
          <input
            type="range"
            min="0"
            max={effectiveDuration || 1}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            disabled={!previewUrl || isLoading || effectiveDuration <= 0}
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(to right, rgb(168, 85, 247) 0%, rgb(168, 85, 247) ${progress}%, rgb(55, 65, 81) ${progress}%, rgb(55, 65, 81) 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(effectiveDuration || 0)}</span>
          </div>
        </div>

        {/* Play/Pause and Volume */}
        <div className="flex items-center gap-3">
          {/* Play/Pause Button */}
          <button
            onClick={handleTogglePlay}
            disabled={!previewUrl || isLoading}
            className="w-10 h-10 rounded-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors flex-shrink-0"
            aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>

          {/* Volume Control */}
          <div className="flex-1 flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-gray-400 hover:text-purple-400 transition-colors"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-xs text-red-400 text-center bg-red-500/10 border border-red-500/30 rounded px-2 py-1">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
