"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeatherByCoords = exports.getWeatherByCity = void 0;
const axios_1 = __importDefault(require("axios"));
const getWeatherByCity = async (city) => {
    // 1. Try OpenWeather API if API key exists
    if (process.env.OPENWEATHER_API_KEY && process.env.OPENWEATHER_API_KEY !== "your_openweather_api_key_here") {
        try {
            const response = await axios_1.default.get("https://api.openweathermap.org/data/2.5/weather", {
                params: {
                    q: city,
                    appid: process.env.OPENWEATHER_API_KEY,
                    units: "metric"
                }
            });
            const data = response.data;
            return {
                city: data.name,
                country: data.sys.country || "",
                temperature: Math.round(data.main.temp),
                feelsLike: Math.round(data.main.feels_like),
                humidity: data.main.humidity,
                windSpeed: Math.round(data.wind.speed),
                visibility: Math.round((data.visibility || 10000) / 1000), // convert to km
                cloudCover: data.clouds ? data.clouds.all : 0,
                condition: data.weather[0].main,
                description: data.weather[0].description,
                icon: data.weather[0].icon,
                latitude: data.coord.lat,
                longitude: data.coord.lon
            };
        }
        catch (err) {
            console.warn("OpenWeather API failed or invalid key, falling back to Open-Meteo...");
        }
    }
    // 2. Fallback to Open-Meteo (Free API requiring no key)
    const geoResponse = await axios_1.default.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
        throw new Error(`City '${city}' not found`);
    }
    const location = geoResponse.data.results[0];
    const lat = location.latitude;
    const lon = location.longitude;
    const cityName = location.name;
    const country = location.country_code || location.country || "";
    const weatherResponse = await axios_1.default.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,cloud_cover,wind_speed_10m,visibility`);
    const current = weatherResponse.data.current;
    // Weather code interpretation
    const code = current.weather_code;
    let condition = "Clear";
    let description = "Clear sky";
    if (code === 1 || code === 2 || code === 3) {
        condition = "Clouds";
        description = code === 1 ? "Mainly clear" : code === 2 ? "Partly cloudy" : "Overcast";
    }
    else if (code >= 45 && code <= 48) {
        condition = "Fog";
        description = "Foggy conditions";
    }
    else if (code >= 51 && code <= 55) {
        condition = "Drizzle";
        description = "Light drizzle";
    }
    else if (code >= 61 && code <= 67) {
        condition = "Rain";
        description = "Rainy weather";
    }
    else if (code >= 71 && code <= 77) {
        condition = "Snow";
        description = "Snowfall";
    }
    else if (code >= 80 && code <= 82) {
        condition = "Rain";
        description = "Rain showers";
    }
    else if (code >= 95) {
        condition = "Thunderstorm";
        description = "Thunderstorm";
    }
    return {
        city: cityName,
        country: country,
        temperature: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        visibility: Math.round((current.visibility || 10000) / 1000), // km
        cloudCover: current.cloud_cover,
        condition: condition,
        description: description,
        icon: "01d",
        latitude: lat,
        longitude: lon
    };
};
exports.getWeatherByCity = getWeatherByCity;
const getWeatherByCoords = async (lat, lon) => {
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        throw new Error("Invalid coordinates provided");
    }
    const weatherResponse = await axios_1.default.get("https://api.open-meteo.com/v1/forecast", {
        params: {
            latitude: lat,
            longitude: lon,
            current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m,pressure_msl,surface_pressure,precipitation,dew_point_2m,visibility,uv_index",
            daily: "weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,precipitation_sum,wind_speed_10m_max,uv_index_max",
            timezone: "auto",
            forecast_days: 7
        }
    });
    if (!weatherResponse.data || !weatherResponse.data.current) {
        throw new Error("No weather data available for this location");
    }
    const current = weatherResponse.data.current;
    const daily = weatherResponse.data.daily;
    const code = current.weather_code;
    let condition = "Clear";
    let description = "Clear sky";
    if (code === 1 || code === 2 || code === 3) {
        condition = "Clouds";
        description = code === 1 ? "Mainly clear" : code === 2 ? "Partly cloudy" : "Overcast";
    }
    else if (code >= 45 && code <= 48) {
        condition = "Fog";
        description = "Foggy conditions";
    }
    else if (code >= 51 && code <= 55) {
        condition = "Drizzle";
        description = "Light drizzle";
    }
    else if (code >= 61 && code <= 67) {
        condition = "Rain";
        description = "Rainy weather";
    }
    else if (code >= 71 && code <= 77) {
        condition = "Snow";
        description = "Snowfall";
    }
    else if (code >= 80 && code <= 82) {
        condition = "Rain";
        description = "Rain showers";
    }
    else if (code >= 95) {
        condition = "Thunderstorm";
        description = "Thunderstorm";
    }
    const forecastDays = daily.time?.map((date, i) => ({
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
        condition: condition,
        description: description,
        icon: "01d",
        latitude: lat,
        longitude: lon,
        timezone: weatherResponse.data.timezone,
        forecast: forecastDays,
    };
};
exports.getWeatherByCoords = getWeatherByCoords;
