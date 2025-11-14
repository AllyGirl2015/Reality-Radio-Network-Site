'use client';

interface Live365PlayerProps {
  stationId?: string;
  stationName?: string;
  height?: number;
  width?: number | string;
}

export default function Live365Player({ 
  stationId = "a47993", 
  stationName = "Reality Central Radio",
  height = 250,
  width = "100%" 
}: Live365PlayerProps) {
  return (
    <div className="card-neon">
      <div className="mb-4">
        <h3 className="text-xl font-bold neon-text mb-2">{stationName}</h3>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff] inline-block">
          🔴 LIVE NOW
        </span>
      </div>
      
      <div className="relative w-full overflow-hidden rounded-lg border border-[#00f3ff]/30 bg-black">
        <iframe
          src={`https://live365.com/embed/popout?l=${stationId}`}
          width={typeof width === 'number' ? width : '100%'}
          height={height}
          frameBorder="0"
          scrolling="no"
          allow="autoplay"
          title={`${stationName} Live Player`}
          style={{ 
            border: 'none',
            display: 'block',
            minHeight: `${height}px`
          }}
        />
      </div>

      <div className="mt-4 pt-4 border-t border-[#00f3ff]/20">
        <p className="text-xs text-gray-400 text-center">
          🎵 Powered by{' '}
          <a 
            href="https://live365.com/station/201-5-Reality-Central-Radio-a47993" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#00f3ff] hover:text-[#0ff] transition-colors"
            aria-label="Visit Reality Central Radio on Live365"
          >
            Live365
          </a>
        </p>
      </div>
    </div>
  );
}
