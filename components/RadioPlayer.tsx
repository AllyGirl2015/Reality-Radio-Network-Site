'use client';

import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface RadioPlayerProps {
  streamUrl: string;
  stationName: string;
  tagline?: string;
}

export default function RadioPlayer({ streamUrl, stationName, tagline }: RadioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
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

  return (
    <div className="card-neon">
      <audio ref={audioRef} src={streamUrl} preload="none" />
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold neon-text">{stationName}</h3>
          {tagline && <p className="text-sm text-gray-400 mt-1">{tagline}</p>}
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isPlaying 
              ? 'bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]' 
              : 'bg-gray-800 text-gray-400'
          }`}>
            {isPlaying ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="w-14 h-14 rounded-full bg-[#00f3ff] hover:bg-[#0ff] text-black flex items-center justify-center transition-all duration-300 hover:shadow-neon-strong-cyan"
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
        </button>

        {/* Volume Control */}
        <div className="flex-1 flex items-center space-x-3">
          <button
            onClick={toggleMute}
            className="text-[#00f3ff] hover:text-[#0ff] transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#00f3ff]"
          />
        </div>
      </div>

      {/* Now Playing Info */}
      <div className="mt-4 pt-4 border-t border-[#00f3ff]/20">
        <p className="text-xs text-gray-500 mb-1">Now Playing</p>
        <p className="text-sm text-white font-medium">Live Broadcast</p>
      </div>
    </div>
  );
}
