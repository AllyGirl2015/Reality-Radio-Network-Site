'use client';

interface Live365PlayerProps {
  stationId?: string;
  stationName?: string;
  compact?: boolean;
}

export default function Live365Player({ 
  stationId = "a47993", 
  stationName = "Reality Central Radio",
  compact = false
}: Live365PlayerProps) {
  return (
    <div className="w-full h-full">
      {/* Player Embed */}
      <div className="w-full h-full">
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          src={`https://live365.com/${stationId}/embeds/v1/player/${stationId}?s=null&m=null&c=mp3`}
          title={`${stationName} Live Player`}
          allow="autoplay"
          style={{ 
            border: 'none',
            display: 'block',
            width: '100%',
            height: '100vh',
            maxHeight: '600px'
          }}
        />
      </div>

      {compact ? (
        // Versão compacta - apenas player
        null
      ) : (
        // Versão completa - com last played
        <>
          <div className="mt-4 text-center">
            <button 
              type="button"
              className="btn-neon-purple text-sm px-4 py-2 inline-flex items-center gap-2"
              onClick={() => {
                const lastPlayed = document.getElementById('last-played-section');
                if (lastPlayed) {
                  lastPlayed.classList.toggle('hidden');
                }
              }}
            >
              View Recently Played Tracks
            </button>
          </div>

          {/* Last Played - Colapsável */}
          <div id="last-played-section" className="hidden mt-4">
            <div className="w-full rounded-lg overflow-hidden">
              <iframe
                width="100%"
                height="511"
                frameBorder="0"
                src={`https://live365.com/embeds/v1/played/${stationId}?s=md&m=dark`}
                title={`${stationName} Recently Played`}
                style={{ 
                  border: 'none',
                  display: 'block',
                  width: '100%'
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
