import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Pause, Music, X } from "lucide-react";

interface SoundTrack {
  id: string;
  name: string;
  emoji: string;
  url: string;
  defaultVolume: number;
}

const SOUNDS: SoundTrack[] = [
  {
    id: "rain",
    name: "Rain Sound",
    emoji: "🌧️",
    url: "https://raw.githubusercontent.com/bradtraversy/ambient-sound-mixer/main/sounds/rain.mp3",
    defaultVolume: 0.4
  },
  {
    id: "ocean",
    name: "Ocean Waves",
    emoji: "🌊",
    url: "https://raw.githubusercontent.com/bradtraversy/ambient-sound-mixer/main/sounds/ocean.mp3",
    defaultVolume: 0.3
  },
  {
    id: "wind",
    name: "Wind Blow",
    emoji: "🌬️",
    url: "https://raw.githubusercontent.com/bradtraversy/ambient-sound-mixer/main/sounds/wind.mp3",
    defaultVolume: 0.2
  },
  {
    id: "fireplace",
    name: "Fireplace Crackle",
    emoji: "🔥",
    url: "https://raw.githubusercontent.com/bradtraversy/ambient-sound-mixer/main/sounds/fireplace.mp3",
    defaultVolume: 0.5
  }
];

const PRESETS = [
  {
    name: "Cozy Cabin",
    volumes: { fireplace: 0.8, rain: 0.3, wind: 0.1, ocean: 0.0 }
  },
  {
    name: "Ocean Storm",
    volumes: { fireplace: 0.0, rain: 0.4, wind: 0.5, ocean: 0.7 }
  },
  {
    name: "Deep Focus",
    volumes: { fireplace: 0.0, rain: 0.6, wind: 0.2, ocean: 0.0 }
  },
  {
    name: "Mute All",
    volumes: { fireplace: 0.0, rain: 0.0, wind: 0.0, ocean: 0.0 }
  }
];

const AmbientSounds = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<Record<string, boolean>>({
    rain: false,
    ocean: false,
    wind: false,
    fireplace: false
  });
  const [volumes, setVolumes] = useState<Record<string, number>>({
    rain: 0.4,
    ocean: 0.3,
    wind: 0.2,
    fireplace: 0.5
  });

  // Reference to keep track of Audio instances
  const audioInstances = useRef<Record<string, HTMLAudioElement>>({});

  // Initialize audio elements once
  useEffect(() => {
    SOUNDS.forEach((sound) => {
      const audio = new Audio(sound.url);
      audio.loop = true;
      // Preload audio files
      audio.preload = "auto";
      audioInstances.current[sound.id] = audio;
    });

    // Cleanup on unmount: stop all sounds
    return () => {
      Object.values(audioInstances.current).forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
    };
  }, []);

  // Update playing states and volumes when state changes
  useEffect(() => {
    SOUNDS.forEach((sound) => {
      const audio = audioInstances.current[sound.id];
      if (audio) {
        audio.volume = volumes[sound.id];
        const shouldPlay = isPlaying[sound.id];

        if (shouldPlay && audio.paused) {
          // Play the audio with error handling (e.g. browser autoplay policies)
          audio.play().catch((err) => {
            console.warn(`Audio playback failed for ${sound.id}:`, err);
            // Revert play state if blocked
            setIsPlaying((prev) => ({ ...prev, [sound.id]: false }));
          });
        } else if (!shouldPlay && !audio.paused) {
          audio.pause();
        }
      }
    });
  }, [isPlaying, volumes]);

  const toggleSound = (id: string) => {
    setIsPlaying((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleVolumeChange = (id: string, value: number) => {
    setVolumes((prev) => ({
      ...prev,
      [id]: value
    }));
    // Auto-play if volume is increased and was muted/paused
    if (value > 0 && !isPlaying[id]) {
      setIsPlaying((prev) => ({ ...prev, [id]: true }));
    }
  };

  const applyPreset = (presetVolumes: Record<string, number>) => {
    setVolumes(presetVolumes);
    const newPlaying: Record<string, boolean> = {};
    Object.keys(presetVolumes).forEach((key) => {
      newPlaying[key] = presetVolumes[key] > 0;
    });
    setIsPlaying(newPlaying);
  };

  const handleMasterStop = () => {
    setIsPlaying({
      rain: false,
      ocean: false,
      wind: false,
      fireplace: false
    });
  };

  const isAnyPlaying = Object.values(isPlaying).some(Boolean);

  return (
    <div className="ambient-sounds-wrapper">
      {/* Floating Trigger Button */}
      <button
        type="button"
        className={`ambient-trigger-btn ${isOpen ? "open" : ""} ${isAnyPlaying ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Ambient Sound Mixer"
      >
        {isAnyPlaying ? (
          <div className="music-pulse-indicator">
            <span className="bar" />
            <span className="bar" />
            <span className="bar" />
          </div>
        ) : (
          <Music size={20} />
        )}
      </button>

      {/* Glassmorphism Control Panel */}
      {isOpen && (
        <div className="ambient-panel">
          <div className="ambient-header">
            <div className="title-group">
              <Music size={18} className="header-icon" />
              <h3>Ambient Sounds</h3>
            </div>
            <button
              type="button"
              className="close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close panel"
            >
              <X size={16} />
            </button>
          </div>

          <div className="ambient-body">
            <p className="ambient-subtitle">Mix and match sounds for your ideal focus or rest environment.</p>

            {/* Mixer Tracks */}
            <div className="tracks-list">
              {SOUNDS.map((sound) => {
                const playing = isPlaying[sound.id];
                const volume = volumes[sound.id];

                return (
                  <div key={sound.id} className={`track-card ${playing ? "playing" : ""}`}>
                    <button
                      type="button"
                      className="track-emoji-btn"
                      onClick={() => toggleSound(sound.id)}
                    >
                      <span className="emoji">{sound.emoji}</span>
                    </button>

                    <div className="track-info">
                      <div className="track-header">
                        <span className="track-name">{sound.name}</span>
                        <span className="track-percentage">{Math.round(volume * 100)}%</span>
                      </div>

                      <div className="track-controls">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={volume}
                          onChange={(e) => handleVolumeChange(sound.id, parseFloat(e.target.value))}
                          className="track-slider"
                          aria-label={`${sound.name} volume`}
                        />
                        <button
                          type="button"
                          className="track-mute-btn"
                          onClick={() => toggleSound(sound.id)}
                        >
                          {playing && volume > 0 ? (
                            <Volume2 size={16} className="icon-on" />
                          ) : (
                            <VolumeX size={16} className="icon-off" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Presets */}
            <div className="presets-section">
              <h4>Presets</h4>
              <div className="presets-grid">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    className="preset-btn"
                    onClick={() => applyPreset(preset.volumes)}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          {isAnyPlaying && (
            <div className="ambient-footer">
              <button
                type="button"
                className="master-stop-btn"
                onClick={handleMasterStop}
              >
                <Pause size={14} style={{ marginRight: 6 }} />
                Pause All
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AmbientSounds;
