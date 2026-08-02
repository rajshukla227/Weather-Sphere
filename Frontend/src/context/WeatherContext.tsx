import React, { createContext, useContext, useState } from "react";

interface WeatherContextType {
  weatherCondition: string | null;
  setWeatherCondition: (condition: string | null) => void;
}

const WeatherContext = createContext<WeatherContextType>({
  weatherCondition: null,
  setWeatherCondition: () => {},
});

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [weatherCondition, setWeatherCondition] = useState<string | null>(null);

  return (
    <WeatherContext.Provider value={{ weatherCondition, setWeatherCondition }}>
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => useContext(WeatherContext);
