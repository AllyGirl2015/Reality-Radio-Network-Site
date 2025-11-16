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
          src={`https://live365.com/embeds/v1/player/${stationId}?s=md&m=dark&c=mp3`}
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
        // Versão completa - com last played e links alternativos
        <>
          {/* Links alternativos para Reality Central Radio */}
          {stationId === "a47993" && (
            <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://live365.com/station/201-5-Reality-Central-Radio-a47993"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-neon-purple text-sm px-4 py-2 inline-flex items-center justify-center gap-2 whitespace-nowrap"
              >
                Live365 201.5-RCR
              </a>
              <a
                href="https://streaming.live365.com/a47993"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-neon text-sm px-4 py-2 inline-flex items-center justify-center gap-2 whitespace-nowrap"
              >
                MP3 Stream
              </a>
            </div>
          )}

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
