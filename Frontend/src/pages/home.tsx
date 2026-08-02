import { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import WeatherMap from "../components/WeatherMap";
import WeatherCard from "../components/WeatherCard";
import WeatherDetails from "../components/WeatherDetails";
import AuthModal from "../components/AuthModal";
import { fetchWeatherData, getCurrentUser, logoutUser } from "../services/api";
import { useWeather } from "../context/WeatherContext";
import {
  AlertCircle,
  User,
  LogOut,
  LogIn
} from "lucide-react";

export interface WeatherData {
  city: string;
  country?: string;
  temperature: number;
  feelsLike?: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  cloudCover: number;
  condition: string;
  description: string;
  latitude?: number;
  longitude?: number;
  hourly?: {
    time: string;
    temperature: number;
    weatherCode: number;
    precipitationProbability?: number;
  }[];
}

const Home = () => {
  const [weather, setWeather] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const { setWeatherCondition } = useWeather();

  useEffect(() => {
    if (weather?.condition) {
      setWeatherCondition(weather.condition);
    }
  }, [weather, setWeatherCondition]);

  useEffect(() => {
    const savedUser = getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);


  const searchWeather = async (cityName: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherData(cityName);
      setWeather(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "City not found. Please try another location.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchWeather("Lucknow");
  }, []);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <div className="weather-sphere-app">
      <header className="app-header">
        <div className="header-top">
          <div className="brand">
            <div className="logo-orb" />
            <h1>WeatherSphere</h1>
          </div>

          <div className="user-auth-section">
            {user ? (
              <div className="user-badge">
                <User size={16} />
                <span>{user.name}</span>
                <button type="button" className="logout-btn" onClick={handleLogout} title="Logout">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button type="button" className="login-trigger-btn" onClick={() => setIsAuthOpen(true)}>
                <LogIn size={16} style={{ marginRight: 6 }} />
                Sign In
              </button>
            )}
          </div>
        </div>
        <p className="subtitle">Search weather</p>
      </header>

      <section className="search-section">
        <SearchBar onSearch={searchWeather} loading={loading} />
      </section>

      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {weather && (
        <main className="weather-content">
          <WeatherCard weather={weather} />

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

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(u) => setUser(u)}
      />

      <footer className="app-footer">
        <p>WeatherSphere &copy; {new Date().getFullYear()} • Powered by Live Weather API</p>
      </footer>
    </div>
  );
};

export default Home;