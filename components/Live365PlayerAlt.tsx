'use client';

/**
 * Componente alternativo do Live365 Player com diferentes formatos de embed
 * Use este se o formato padrão não funcionar
 */

interface Live365PlayerAltProps {
  stationId?: string;
  stationName?: string;
  embedType?: 'popout' | 'standard' | 'mini';
  height?: number;
}

export default function Live365PlayerAlt({ 
  stationId = "a47993", 
  stationName = "Reality Central Radio",
  embedType = "popout",
  height = 250 
}: Live365PlayerAltProps) {
  
  // Diferentes formatos de embed do Live365
  const getEmbedUrl = () => {
    switch (embedType) {
      case 'popout':
        // Formato popout (recomendado)
        return `https://live365.com/embed/popout?l=${stationId}`;
      case 'standard':
        // Formato player padrão
        return `https://player.live365.com/${stationId}`;
      case 'mini':
        // Formato mini player
        return `https://live365.com/embed/mini?l=${stationId}`;
      default:
        return `https://player.live365.com/${stationId}`;
    }
  };

  return (
    <div className="card-neon">
      <div className="mb-4">
        <h3 className="text-xl font-bold neon-text mb-2">{stationName}</h3>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff] inline-block">
            🔴 LIVE NOW
          </span>
          <span className="text-xs text-gray-500">The Realest Mix Around</span>
        </div>
      </div>
      
      <div className="relative w-full overflow-hidden rounded-lg border border-[#00f3ff]/30 bg-black">
        <iframe
          src={getEmbedUrl()}
          width="100%"
          height={height}
          frameBorder="0"
          scrolling="no"
          allow="autoplay"
          title={`${stationName} Live Player`}
          style={{ 
            border: 'none',
            display: 'block'
          }}
        />
      </div>

      <div className="mt-4 pt-4 border-t border-[#00f3ff]/20">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <p>
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
          <p className="text-gray-500">
            Embed: {embedType}
          </p>
        </div>
      </div>

      {/* Fallback link caso o player não carregue */}
      <noscript>
        <div className="mt-4 p-4 bg-gray-800 rounded-lg text-center">
          <p className="text-gray-300 mb-2">JavaScript required for live player</p>
          <a 
            href="https://live365.com/station/201-5-Reality-Central-Radio-a47993"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00f3ff] hover:text-[#0ff] underline"
          >
            Listen on Live365 →
          </a>
        </div>
      </noscript>
    </div>
  );
}
