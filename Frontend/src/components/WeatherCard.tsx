import { MapPin, Star, CloudSun, CloudRain, CloudLightning, Sun, Cloud, Snowflake } from "lucide-react";

interface WeatherCardProps {
  weather: {
    city: string;
    country?: string;
    temperature: number;
    feelsLike?: number;
    condition: string;
    description: string;
    latitude?: number;
    longitude?: number;
  };
  isSaved?: boolean;
  onToggleSave?: () => void;
}

const WeatherCard = ({ weather, isSaved = false, onToggleSave }: WeatherCardProps) => {
  const getWeatherIcon = (condition: string) => {
    const cond = condition.toLowerCase();
    if (cond.includes("cloud")) return <CloudSun size={48} className="weather-hero-icon cloud-sun" />;
    if (cond.includes("rain") || cond.includes("drizzle")) return <CloudRain size={48} className="weather-hero-icon rain" />;
    if (cond.includes("thunder") || cond.includes("lightning")) return <CloudLightning size={48} className="weather-hero-icon storm" />;
    if (cond.includes("snow")) return <Snowflake size={48} className="weather-hero-icon snow" />;
    if (cond.includes("clear") || cond.includes("sun")) return <Sun size={48} className="weather-hero-icon sun" />;
    return <Cloud size={48} className="weather-hero-icon" />;
  };

  return (
    <div className="weather-hero-card">
      <div className="card-top-bar">
        <div className="location-badge">
          <MapPin size={22} className="pin-icon" />
          <h2>
            {weather.city}
            {weather.country ? `, ${weather.country}` : ""}
          </h2>
        </div>

        {onToggleSave && (
          <button
            type="button"
            className={`star-save-btn ${isSaved ? "saved" : ""}`}
            onClick={onToggleSave}
            title={isSaved ? "Remove from saved locations" : "Save location"}
          >
            <Star size={18} fill={isSaved ? "#fde047" : "none"} color={isSaved ? "#fde047" : "currentColor"} />
            <span>{isSaved ? "Saved ⭐" : "⭐ Save Location"}</span>
          </button>
        )}
      </div>

      <div className="temp-display">
        <span className="main-temp">{Math.round(weather.temperature)}°C</span>
        <div className="condition-box">
          {getWeatherIcon(weather.condition)}
          <span className="condition-text">{weather.condition}</span>
          {weather.feelsLike !== undefined && (
            <span className="feels-like">Feels like {Math.round(weather.feelsLike)}°C</span>
          )}
        </div>
      </div>

      {weather.description && (
        <p className="description-text">{weather.description}</p>
      )}
    </div>
  );
};

export default WeatherCard;
