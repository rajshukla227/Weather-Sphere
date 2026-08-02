import React from "react";
import {
  Droplets,
  Wind,
  Eye,
  Cloud,
  Gauge,
  Thermometer,
  Sun,
  Compass,
  Zap,
  CloudRain,
  CloudSun,
  CloudLightning,
  Snowflake,
  Activity,
  Layers,
  ThermometerSnowflake,
  Clock
} from "lucide-react";

export interface WeatherDetailsProps {
  city?: string;
  country?: string;
  humidity: number;
  windSpeed: number;
  windDirection?: number;
  windGust?: number;
  visibility: number;
  cloudCover: number;
  pressure?: number;
  surfacePressure?: number;
  precipitation?: number;
  dewPoint?: number;
  uvIndex?: number;
  feelsLike?: number;
  temperature?: number;
  condition?: string;
  description?: string;
  evapotranspiration?: number;
  vaporPressureDeficit?: number;
  wetbulbTemperature?: number;
  hourly?: {
    time: string;
    temperature: number;
    weatherCode: number;
    precipitationProbability?: number;
  }[];
  forecast?: {
    date: string;
    weatherCode: number;
    tempMax: number;
    tempMin: number;
    feelsLikeMax: number;
    feelsLikeMin: number;
    sunrise?: string;
    sunset?: string;
    precipitation: number;
    windSpeedMax: number;
    uvIndexMax?: number;
  }[];
}

const WeatherDetails: React.FC<WeatherDetailsProps> = ({
  humidity,
  windSpeed,
  windDirection,
  windGust,
  visibility,
  cloudCover,
  pressure,
  surfacePressure,
  precipitation,
  dewPoint,
  uvIndex,
  feelsLike,
  temperature,
  evapotranspiration,
  vaporPressureDeficit,
  wetbulbTemperature,
  hourly,
  forecast,
}) => {
  const getWindDirectionStr = (deg: number) => {
    const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return dirs[Math.round(deg / 22.5) % 16];
  };

  const getUvCategory = (uv: number) => {
    if (uv <= 2) return { label: "Low", color: "#4ade80", bg: "rgba(74, 222, 128, 0.15)" };
    if (uv <= 5) return { label: "Moderate", color: "#facc15", bg: "rgba(250, 204, 21, 0.15)" };
    if (uv <= 7) return { label: "High", color: "#fb923c", bg: "rgba(251, 146, 60, 0.15)" };
    if (uv <= 10) return { label: "Very High", color: "#f87171", bg: "rgba(248, 113, 113, 0.15)" };
    return { label: "Extreme", color: "#c084fc", bg: "rgba(192, 132, 252, 0.15)" };
  };

  const getHumidityCategory = (h: number) => {
    if (h < 30) return { label: "Dry", color: "#f87171" };
    if (h <= 60) return { label: "Comfortable", color: "#38bdf8" };
    if (h <= 80) return { label: "Humid", color: "#fb923c" };
    return { label: "Very Humid", color: "#c084fc" };
  };

  const getVisibilityCategory = (v: number) => {
    if (v >= 10) return { label: "Excellent", color: "#4ade80" };
    if (v >= 6) return { label: "Good", color: "#38bdf8" };
    if (v >= 3) return { label: "Moderate", color: "#facc15" };
    return { label: "Poor / Foggy", color: "#f87171" };
  };

  const getForecastIcon = (code: number) => {
    if (code === 0 || code === 1) return <Sun size={24} className="forecast-icon sun" />;
    if (code === 2 || code === 3) return <CloudSun size={24} className="forecast-icon cloud" />;
    if (code >= 45 && code <= 48) return <Cloud size={24} className="forecast-icon fog" />;
    if (code >= 51 && code <= 67) return <CloudRain size={24} className="forecast-icon rain" />;
    if (code >= 71 && code <= 77) return <Snowflake size={24} className="forecast-icon snow" />;
    if (code >= 80 && code <= 82) return <CloudRain size={24} className="forecast-icon rain" />;
    if (code >= 95) return <CloudLightning size={24} className="forecast-icon storm" />;
    return <CloudSun size={24} className="forecast-icon" />;
  };

  const uvCat = uvIndex !== undefined ? getUvCategory(uvIndex) : null;
  const humCat = getHumidityCategory(humidity);
  const visCat = getVisibilityCategory(visibility);

  return (
    <div className="weather-details-wrapper">
      {/* SECTION 1: Weather Parameters */}
      <section className="metrics-section">
        <div className="section-header-row">
          <div className="section-title-group">
            <Activity size={18} className="section-header-icon" />
            <h3 className="section-title">Atmospheric Parameters</h3>
          </div>
          <span className="live-indicator">
            <span className="live-dot" /> Live Conditions
          </span>
        </div>

        <div className="metrics-grid">
          {/* Temperature & Feels Like */}
          <div className="metric-card metric-temp-card">
            <div className="metric-header">
              <div className="icon-badge temp-badge">
                <Thermometer size={18} />
              </div>
              <span className="metric-label">Temperature</span>
            </div>
            <div className="metric-value-group">
              <span className="metric-value">{temperature !== undefined ? `${temperature}°` : "--"}</span>
              {feelsLike !== undefined && (
                <span className="metric-sub-badge">Feels {feelsLike}°C</span>
              )}
            </div>
            {dewPoint !== undefined && (
              <div className="metric-footer-note">
                <span>Dew Point:</span> <strong>{dewPoint}°C</strong>
              </div>
            )}
          </div>

          {/* Humidity Card */}
          <div className="metric-card metric-humidity-card">
            <div className="metric-header">
              <div className="icon-badge humidity-badge">
                <Droplets size={18} />
              </div>
              <span className="metric-label">Humidity</span>
            </div>
            <div className="metric-value-group">
              <span className="metric-value">{humidity}%</span>
              <span className="metric-status-pill" style={{ color: humCat.color, background: `${humCat.color}18` }}>
                {humCat.label}
              </span>
            </div>
            <div className="metric-progress-bar">
              <div
                className="progress-fill humidity-fill"
                style={{ width: `${Math.min(100, Math.max(0, humidity))}%` }}
              />
            </div>
          </div>

          {/* Wind Card */}
          <div className="metric-card metric-wind-card">
            <div className="metric-header">
              <div className="icon-badge wind-badge">
                <Wind size={18} />
              </div>
              <span className="metric-label">Wind & Gusts</span>
            </div>
            <div className="metric-value-group">
              <span className="metric-value">{windSpeed} <span className="unit">m/s</span></span>
              {windDirection !== undefined && (
                <div className="wind-compass-badge">
                  <Compass
                    size={14}
                    style={{ transform: `rotate(${windDirection}deg)`, transition: "transform 0.4s ease" }}
                  />
                  <span>{getWindDirectionStr(windDirection)}</span>
                </div>
              )}
            </div>
            {windGust !== undefined && (
              <div className="metric-footer-note">
                <span>Max Gust:</span> <strong>{windGust} m/s</strong>
              </div>
            )}
          </div>

          {/* Pressure Card */}
          <div className="metric-card metric-pressure-card">
            <div className="metric-header">
              <div className="icon-badge pressure-badge">
                <Gauge size={18} />
              </div>
              <span className="metric-label">Barometric Pressure</span>
            </div>
            <div className="metric-value-group">
              <span className="metric-value">
                {pressure ? pressure : "--"} <span className="unit">hPa</span>
              </span>
            </div>
            {surfacePressure !== undefined && (
              <div className="metric-footer-note">
                <span>Surface:</span> <strong>{surfacePressure.toFixed(1)} hPa</strong>
              </div>
            )}
          </div>

          {/* UV Index Card */}
          <div className="metric-card metric-uv-card">
            <div className="metric-header">
              <div className="icon-badge uv-badge">
                <Sun size={18} />
              </div>
              <span className="metric-label">UV Index</span>
            </div>
            <div className="metric-value-group">
              <span className="metric-value">{uvIndex !== undefined ? uvIndex : "--"}</span>
              {uvCat && (
                <span className="metric-status-pill" style={{ color: uvCat.color, background: uvCat.bg }}>
                  {uvCat.label}
                </span>
              )}
            </div>
            {uvIndex !== undefined && (
              <div className="metric-progress-bar">
                <div
                  className="progress-fill uv-fill"
                  style={{ width: `${Math.min(100, (uvIndex / 12) * 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Visibility Card */}
          <div className="metric-card metric-visibility-card">
            <div className="metric-header">
              <div className="icon-badge visibility-badge">
                <Eye size={18} />
              </div>
              <span className="metric-label">Visibility</span>
            </div>
            <div className="metric-value-group">
              <span className="metric-value">{visibility} <span className="unit">km</span></span>
              <span className="metric-status-pill" style={{ color: visCat.color, background: `${visCat.color}18` }}>
                {visCat.label}
              </span>
            </div>
          </div>

          {/* Cloud Cover Card */}
          <div className="metric-card metric-cloud-card">
            <div className="metric-header">
              <div className="icon-badge cloud-badge">
                <Cloud size={18} />
              </div>
              <span className="metric-label">Cloud Cover</span>
            </div>
            <div className="metric-value-group">
              <span className="metric-value">{cloudCover}%</span>
            </div>
            <div className="metric-progress-bar">
              <div
                className="progress-fill cloud-fill"
                style={{ width: `${Math.min(100, Math.max(0, cloudCover))}%` }}
              />
            </div>
          </div>

          {/* Precipitation Card */}
          <div className="metric-card metric-precip-card">
            <div className="metric-header">
              <div className="icon-badge precip-badge">
                <Zap size={18} />
              </div>
              <span className="metric-label">Precipitation</span>
            </div>
            <div className="metric-value-group">
              <span className="metric-value">
                {precipitation !== undefined ? precipitation : 0} <span className="unit">mm</span>
              </span>
            </div>
          </div>
        </div>

        {/* Supplementary Advanced Metrics (if available) */}
        {(evapotranspiration !== undefined || vaporPressureDeficit !== undefined || wetbulbTemperature !== undefined) && (
          <div className="advanced-metrics-section">
            <div className="advanced-title-row">
              <Layers size={15} />
              <span>Extended Environmental Indicators</span>
            </div>
            <div className="advanced-grid">
              {evapotranspiration !== undefined && (
                <div className="advanced-pill">
                  <span>Evapotranspiration</span>
                  <strong>{evapotranspiration} mm</strong>
                </div>
              )}
              {vaporPressureDeficit !== undefined && (
                <div className="advanced-pill">
                  <span>Vapor Pressure Deficit</span>
                  <strong>{vaporPressureDeficit} hPa</strong>
                </div>
              )}
              {wetbulbTemperature !== undefined && (
                <div className="advanced-pill">
                  <ThermometerSnowflake size={14} />
                  <span>Wet Bulb Temp</span>
                  <strong>{wetbulbTemperature}°C</strong>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* SECTION 2: Hourly Forecast */}
      {hourly && hourly.length > 0 && (
        <section className="hourly-section">
          <div className="section-header-row">
            <div className="section-title-group">
              <Clock size={18} className="section-header-icon hourly-header-icon" />
              <h3 className="section-title">Hourly Forecast</h3>
            </div>
            <span className="hourly-subtitle">Next 24 Hours</span>
          </div>

          <div className="hourly-carousel">
            {hourly.map((item, i) => (
              <div className={`hourly-card ${i === 0 ? "hourly-card-now" : ""}`} key={i}>
                <span className="hourly-time">{item.time}</span>
                <div className="hourly-icon-wrapper">
                  {getForecastIcon(item.weatherCode)}
                </div>
                <span className="hourly-temp">{item.temperature}°</span>
                {item.precipitationProbability !== undefined && item.precipitationProbability > 0 && (
                  <span className="hourly-pop">💧 {item.precipitationProbability}%</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 3: 7-Day Forecast */}
      {forecast && forecast.length > 0 && (
        <section className="forecast-section">
          <div className="section-header-row">
            <div className="section-title-group">
              <CloudRain size={18} className="section-header-icon forecast-header-icon" />
              <h3 className="section-title">7-Day Weather Forecast</h3>
            </div>
          </div>

          <div className="forecast-grid">
            {forecast.map((day, i) => {
              const dateObj = new Date(day.date);
              const dayName = i === 0 ? "Today" : dateObj.toLocaleDateString("en-US", { weekday: "short" });
              const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
              const tempRange = Math.max(1, day.tempMax - day.tempMin);

              return (
                <div className={`forecast-card ${i === 0 ? "forecast-card-today" : ""}`} key={i}>
                  <div className="forecast-card-header">
                    <span className="forecast-day">{dayName}</span>
                    <span className="forecast-date">{dateStr}</span>
                  </div>

                  <div className="forecast-icon-wrapper">
                    {getForecastIcon(day.weatherCode)}
                  </div>

                  <div className="forecast-temps">
                    <span className="temp-max">{day.tempMax}°</span>
                    <div className="temp-bar-bg">
                      <div className="temp-bar-fill" style={{ width: `${Math.min(100, Math.max(25, (tempRange / 30) * 100))}%` }} />
                    </div>
                    <span className="temp-min">{day.tempMin}°</span>
                  </div>

                  <div className="forecast-details-row">
                    <div className="forecast-sub-detail">
                      <Droplets size={12} className="precip-tiny-icon" />
                      <span>{day.precipitation}mm</span>
                    </div>
                    <div className="forecast-sub-detail">
                      <Wind size={12} className="wind-tiny-icon" />
                      <span>{day.windSpeedMax}m/s</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default WeatherDetails;


