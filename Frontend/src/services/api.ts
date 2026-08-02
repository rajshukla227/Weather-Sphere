import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 8000,
});

// Attach JWT token from localStorage to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API Calls
export const loginUser = async (email: string, password: string) => {
  const response = await api.post("/auth/login", { email, password });
  if (response.data.success && response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.data));
  }
  return response.data;
};

export const registerUser = async (name: string, email: string, password: string) => {
  const response = await api.post("/auth/register", { name, email, password });
  if (response.data.success && response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.data));
  }
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

const parseHourlyData = (hourly: any) => {
  if (!hourly || !hourly.time) return [];
  const times: string[] = hourly.time;
  const temps: number[] = hourly.temperature_2m || [];
  const codes: number[] = hourly.weather_code || [];
  const pops: number[] = hourly.precipitation_probability || [];

  const now = new Date();
  const currentHourPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}`;

  let startIndex = times.findIndex((t) => t.startsWith(currentHourPrefix));
  if (startIndex === -1) startIndex = 0;

  return times.slice(startIndex, startIndex + 24).map((timeStr, idx) => {
    const i = startIndex + idx;
    const dateObj = new Date(timeStr);
    const timeFormatted = idx === 0 ? "Now" : dateObj.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });

    return {
      time: timeFormatted,
      temperature: Math.round(temps[i] ?? 0),
      weatherCode: codes[i] ?? 0,
      precipitationProbability: pops[i] ?? 0,
    };
  });
};

// Weather API Call
export const fetchWeatherData = async (city: string) => {
  try {
    const response = await api.post("/weather/search", { city });
    if (response.data && response.data.success) {
      const data = response.data.data;
      if (!data.hourly || data.hourly.length === 0) {
        // Fetch direct hourly if missing
        try {
          const lat = data.latitude;
          const lon = data.longitude;
          if (lat && lon) {
            const hRes = await axios.get("https://api.open-meteo.com/v1/forecast", {
              params: { latitude: lat, longitude: lon, hourly: "temperature_2m,weather_code,precipitation_probability", timezone: "auto" }
            });
            data.hourly = parseHourlyData(hRes.data.hourly);
          }
        } catch (e) {
          console.warn("Hourly secondary fetch failed:", e);
        }
      }
      return data;
    }
  } catch (error) {
    console.warn("Backend server request failed, attempting direct client fetch fallback...", error);
  }

  // Direct client-side fallback via Open-Meteo if backend server is offline
  const geoRes = await axios.get(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
  );

  if (!geoRes.data.results || geoRes.data.results.length === 0) {
    throw new Error(`City '${city}' not found.`);
  }

  const location = geoRes.data.results[0];
  const lat = location.latitude;
  const lon = location.longitude;
  const cityName = location.name;
  const country = location.country_code || location.country || "";

  const weatherRes = await axios.get("https://api.open-meteo.com/v1/forecast", {
    params: {
      latitude: lat,
      longitude: lon,
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m,pressure_msl,surface_pressure,precipitation,dew_point_2m,visibility,uv_index",
      hourly: "temperature_2m,weather_code,precipitation_probability",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,precipitation_sum,wind_speed_10m_max,uv_index_max",
      timezone: "auto",
      forecast_days: 7
    }
  });

  const current = weatherRes.data.current;
  const daily = weatherRes.data.daily;
  const hourly = weatherRes.data.hourly;
  const code = current.weather_code;
  let condition = "Clear";
  let description = "Clear sky";

  if (code === 1 || code === 2 || code === 3) {
    condition = "Clouds";
    description = code === 1 ? "Mainly clear" : code === 2 ? "Partly cloudy" : "Overcast";
  } else if (code >= 45 && code <= 48) {
    condition = "Fog";
    description = "Foggy conditions";
  } else if (code >= 51 && code <= 55) {
    condition = "Drizzle";
    description = "Light drizzle";
  } else if (code >= 61 && code <= 67) {
    condition = "Rain";
    description = "Rainy weather";
  } else if (code >= 71 && code <= 77) {
    condition = "Snow";
    description = "Snowfall";
  } else if (code >= 80 && code <= 82) {
    condition = "Rain";
    description = "Rain showers";
  } else if (code >= 95) {
    condition = "Thunderstorm";
    description = "Thunderstorm";
  }

  const forecastDays = daily.time?.map((date: string, i: number) => ({
    date,
    weatherCode: daily.weather_code[i],
    tempMax: Math.round(daily.temperature_2m_max[i]),
    tempMin: Math.round(daily.temperature_2m_min[i]),
    feelsLikeMax: Math.round(daily.apparent_temperature_max[i]),
    feelsLikeMin: Math.round(daily.apparent_temperature_min[i]),
    sunrise: daily.sunrise[i],
    sunset: daily.sunset[i],
    precipitation: daily.precipitation_sum[i],
    windSpeedMax: Math.round(daily.wind_speed_10m_max[i]),
    uvIndexMax: daily.uv_index_max[i],
  })) || [];

  const hourlyItems = parseHourlyData(hourly);

  return {
    city: cityName,
    country: country,
    temperature: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    humidity: current.relative_humidity_2m,
    windSpeed: Math.round(current.wind_speed_10m),
    windDirection: current.wind_direction_10m,
    windGust: Math.round(current.wind_gusts_10m),
    pressure: Math.round(current.pressure_msl),
    surfacePressure: Math.round(current.surface_pressure),
    precipitation: Math.round((current.precipitation || 0) * 10) / 10,
    dewPoint: Math.round(current.dew_point_2m),
    visibility: Math.round((current.visibility || 10000) / 1000),
    cloudCover: current.cloud_cover,
    uvIndex: Math.round(current.uv_index),
    condition: condition,
    description: description,
    icon: "01d",
    latitude: lat,
    longitude: lon,
    timezone: weatherRes.data.timezone,
    forecast: forecastDays,
    hourly: hourlyItems,
  };
};

export const fetchWeatherByCoords = async (lat: number, lon: number) => {
  try {
    const response = await api.post("/weather/search", { latitude: lat, longitude: lon });
    if (response.data && response.data.success) {
      const data = response.data.data;
      if (!data.hourly || data.hourly.length === 0) {
        try {
          const hRes = await axios.get("https://api.open-meteo.com/v1/forecast", {
            params: { latitude: lat, longitude: lon, hourly: "temperature_2m,weather_code,precipitation_probability", timezone: "auto" }
          });
          data.hourly = parseHourlyData(hRes.data.hourly);
        } catch (e) {
          console.warn("Hourly secondary fetch failed:", e);
        }
      }
      return data;
    }
  } catch (error) {
    console.warn("Backend server request failed, attempting direct client fetch fallback...", error);
  }

  try {
    const weatherRes = await axios.get("https://api.open-meteo.com/v1/forecast", {
      params: {
        latitude: lat,
        longitude: lon,
        current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m,pressure_msl,surface_pressure,precipitation,dew_point_2m,visibility,uv_index",
        hourly: "temperature_2m,weather_code,precipitation_probability",
        daily: "weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,precipitation_sum,wind_speed_10m_max,uv_index_max",
        timezone: "auto",
        forecast_days: 7
      }
    });

    const current = weatherRes.data.current;
    const daily = weatherRes.data.daily;
    const hourly = weatherRes.data.hourly;
    const code = current.weather_code;
    let condition = "Clear";
    let description = "Clear sky";

    if (code === 1 || code === 2 || code === 3) {
      condition = "Clouds";
      description = code === 1 ? "Mainly clear" : code === 2 ? "Partly cloudy" : "Overcast";
    } else if (code >= 45 && code <= 48) {
      condition = "Fog";
      description = "Foggy conditions";
    } else if (code >= 51 && code <= 55) {
      condition = "Drizzle";
      description = "Light drizzle";
    } else if (code >= 61 && code <= 67) {
      condition = "Rain";
      description = "Rainy weather";
    } else if (code >= 71 && code <= 77) {
      condition = "Snow";
      description = "Snowfall";
    } else if (code >= 80 && code <= 82) {
      condition = "Rain";
      description = "Rain showers";
    } else if (code >= 95) {
      condition = "Thunderstorm";
      description = "Thunderstorm";
    }

    const forecastDays = daily.time?.map((date: string, i: number) => ({
      date,
      weatherCode: daily.weather_code[i],
      tempMax: Math.round(daily.temperature_2m_max[i]),
      tempMin: Math.round(daily.temperature_2m_min[i]),
      feelsLikeMax: Math.round(daily.apparent_temperature_max[i]),
      feelsLikeMin: Math.round(daily.apparent_temperature_min[i]),
      sunrise: daily.sunrise[i],
      sunset: daily.sunset[i],
      precipitation: daily.precipitation_sum[i],
      windSpeedMax: Math.round(daily.wind_speed_10m_max[i]),
      uvIndexMax: daily.uv_index_max[i],
    })) || [];

    const hourlyItems = parseHourlyData(hourly);

    return {
      city: `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
      country: "",
      temperature: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      windDirection: current.wind_direction_10m,
      windGust: Math.round(current.wind_gusts_10m),
      pressure: Math.round(current.pressure_msl),
      surfacePressure: Math.round(current.surface_pressure),
      precipitation: Math.round((current.precipitation || 0) * 10) / 10,
      dewPoint: Math.round(current.dew_point_2m),
      visibility: Math.round((current.visibility || 10000) / 1000),
      cloudCover: current.cloud_cover,
      uvIndex: Math.round(current.uv_index),
      evapotranspiration: Math.round((current.evapotranspiration || 0) * 100) / 100,
      vaporPressureDeficit: Math.round((current.vapor_pressure_deficit || 0) * 10) / 10,
      wetbulbTemperature: Math.round((current.wetbulb_temperature_2m || 0) * 10) / 10,
      condition: condition,
      description: description,
      icon: "01d",
      latitude: lat,
      longitude: lon,
      timezone: weatherRes.data.timezone,
      forecast: forecastDays,
      hourly: hourlyItems,
    };
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 400) {
      throw new Error("Weather data is not available for this location. Please try another spot.");
    }
    throw err;
  }
};

export default api;