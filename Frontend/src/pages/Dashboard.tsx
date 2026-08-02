import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import WeatherMap from "../components/WeatherMap";
import WeatherCard from "../components/WeatherCard";
import WeatherDetails from "../components/WeatherDetails";
import api, { fetchWeatherData, fetchWeatherByCoords, getCurrentUser } from "../services/api";
import { useWeather } from "../context/WeatherContext";
import { AlertCircle, MapPin, Search, Crosshair } from "lucide-react";

export interface WeatherData {
  city: string;
  country?: string;
  temperature: number;
  feelsLike?: number;
  humidity: number;
  windSpeed: number;
  windDirection?: number;
  windGust?: number;
  pressure?: number;
  surfacePressure?: number;
  precipitation?: number;
  dewPoint?: number;
  visibility: number;
  cloudCover: number;
  uvIndex?: number;
  evapotranspiration?: number;
  vaporPressureDeficit?: number;
  wetbulbTemperature?: number;
  condition: string;
  description: string;
  icon?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
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
  hourly?: {
    time: string;
    temperature: number;
    weatherCode: number;
    precipitationProbability?: number;
  }[];
}

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const { setWeatherCondition } = useWeather();
  const user = getCurrentUser();

  useEffect(() => {
    if (weather?.condition) {
      setWeatherCondition(weather.condition);
    }
  }, [weather, setWeatherCondition]);


  const loadSavedLocations = async () => {
    if (!user) return;
    try {
      const res = await api.get("/weather/saved");
      if (res.data.success) {
        const savedCities = res.data.data.map((item: any) => item.city.toLowerCase());
        localStorage.setItem("savedCities", JSON.stringify(savedCities));
        if (weather) {
          setIsSaved(savedCities.includes(weather.city.toLowerCase()));
        }
      }
    } catch (e) {
      console.warn("Could not load saved locations:", e);
    }
  };

  useEffect(() => {
    if (weather) {
      const savedCitiesStr = localStorage.getItem("savedCities");
      if (savedCitiesStr) {
        try {
          const list: string[] = JSON.parse(savedCitiesStr);
          setIsSaved(list.includes(weather.city.toLowerCase()));
        } catch {
          setIsSaved(false);
        }
      }
    }
  }, [weather]);

  const handleToggleSave = async () => {
    if (!weather || !user) return;
    try {
      if (isSaved) {
        await api.delete(`/weather/saved/${encodeURIComponent(weather.city)}`);
        const savedCitiesStr = localStorage.getItem("savedCities");
        if (savedCitiesStr) {
          const list: string[] = JSON.parse(savedCitiesStr);
          const updated = list.filter((c) => c !== weather.city.toLowerCase());
          localStorage.setItem("savedCities", JSON.stringify(updated));
        }
        setIsSaved(false);
      } else {
        await api.post("/weather/saved", {
          city: weather.city,
          country: weather.country,
          temperature: weather.temperature,
          condition: weather.condition,
        });
        const savedCitiesStr = localStorage.getItem("savedCities") || "[]";
        const list: string[] = JSON.parse(savedCitiesStr);
        if (!list.includes(weather.city.toLowerCase())) {
          list.push(weather.city.toLowerCase());
        }
        localStorage.setItem("savedCities", JSON.stringify(list));
        setIsSaved(true);
      }
    } catch (err: any) {
      console.error("Save location toggle error:", err);
    }
  };

  const searchWeather = async (cityName: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherData(cityName);
      setWeather(data);
    } catch (err: any) {
      setError(err.message || "City not found. Please try another location.");
    } finally {
      setLoading(false);
    }
  };

  const handleMapLocationSelect = async (lat: number, lng: number) => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError("Invalid map coordinates selected. Please click within the map bounds.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherByCoords(lat, lng);
      setWeather(data);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "Unable to fetch weather for this location.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
      });
      const { latitude, longitude } = position.coords;
      const data = await fetchWeatherByCoords(latitude, longitude);
      setWeather(data);
    } catch (err: any) {
      setError(err.message || "Unable to get your current location.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cityParam = searchParams.get("city");
    searchWeather(cityParam || "Lucknow");
    loadSavedLocations();
  }, []);

  return (
    <div className="weather-sphere-app">
      <Navbar />

      <section className="search-section">
        <div className="mode-toggle">
          <button
            type="button"
            className={`mode-btn ${!mapMode ? "active" : ""}`}
            onClick={() => setMapMode(false)}
          >
            <Search size={16} />
            <span>Search City</span>
          </button>
          <button
            type="button"
            className={`mode-btn ${mapMode ? "active" : ""}`}
            onClick={() => setMapMode(true)}
          >
            <MapPin size={16} />
            <span>Pick on Map</span>
          </button>
          <button
            type="button"
            className="mode-btn"
            onClick={handleCurrentLocation}
            disabled={loading}
          >
            <Crosshair size={16} />
            <span>Current Location</span>
          </button>
        </div>

        {!mapMode && (
          <SearchBar onSearch={searchWeather} loading={loading} />
        )}

        {mapMode && (
          <div className="map-picker-container">
            <WeatherMap
              city={weather?.city}
              latitude={weather?.latitude}
              longitude={weather?.longitude}
              onLocationSelect={handleMapLocationSelect}
              interactive
            />
            <p style={{ color: "var(--text-2)", fontSize: "0.85rem", textAlign: "center", marginTop: 8 }}>
              Click anywhere on the map to view current weather and 7-day forecast for that location
            </p>
          </div>
        )}
      </section>

      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="loading-container">
          <div className="spinner" />
          <span>Loading weather data...</span>
        </div>
      )}

      {weather && (
        <main className="weather-content">
          <WeatherCard
            weather={weather}
            isSaved={isSaved}
            onToggleSave={user ? handleToggleSave : undefined}
          />

          <WeatherDetails
            city={weather.city}
            country={weather.country}
            temperature={weather.temperature}
            feelsLike={weather.feelsLike}
            humidity={weather.humidity}
            windSpeed={weather.windSpeed}
            windDirection={weather.windDirection}
            windGust={weather.windGust}
            visibility={weather.visibility}
            cloudCover={weather.cloudCover}
            pressure={weather.pressure}
            surfacePressure={weather.surfacePressure}
            precipitation={weather.precipitation}
            dewPoint={weather.dewPoint}
            uvIndex={weather.uvIndex}
            evapotranspiration={weather.evapotranspiration}
            vaporPressureDeficit={weather.vaporPressureDeficit}
            wetbulbTemperature={weather.wetbulbTemperature}
            condition={weather.condition}
            description={weather.description}
            hourly={weather.hourly}
            forecast={weather.forecast}
          />

          {weather.latitude !== undefined && weather.longitude !== undefined && (
            <section className="map-section" style={{ marginTop: 12 }}>
              <WeatherMap
                city={weather.city}
                latitude={weather.latitude}
                longitude={weather.longitude}
              />
            </section>
          )}
        </main>
      )}
    </div>
  );
};

export default Dashboard;

