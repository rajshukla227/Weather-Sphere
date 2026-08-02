import { useState, useEffect, useMemo } from "react";
import {
  APIProvider,
  Map,
  Marker
} from "@vis.gl/react-google-maps";
import type { MapMouseEvent } from "@vis.gl/react-google-maps";

interface Props {
  latitude?: number;
  longitude?: number;
  city?: string;
  onLocationSelect?: (lat: number, lng: number) => void;
  interactive?: boolean;
}

const WeatherMap = ({
  latitude = 26.8467,
  longitude = 80.9462,
  city = "Lucknow",
  onLocationSelect,
  interactive = false
}: Props) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const [selectedLat, setSelectedLat] = useState<number | undefined>(latitude);
  const [selectedLng, setSelectedLng] = useState<number | undefined>(longitude);
  const [pickedCity, setPickedCity] = useState<string>("");
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedLat(latitude);
    setSelectedLng(longitude);
    setPickedCity("");
    // Resolve the location name automatically when coordinates change
    if (interactive) {
      reverseGeocode(latitude, longitude);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);

  const mapCenter = useMemo(() => ({
    lat: latitude,
    lng: longitude
  }), [latitude, longitude]);

  const markerPosition = useMemo(() => ({
    lat: selectedLat ?? latitude,
    lng: selectedLng ?? longitude
  }), [selectedLat, selectedLng, latitude, longitude]);

  const reverseGeocode = async (lat: number, lng: number) => {
    // Try Google Maps geocoding first (if API key is present)
    if (apiKey && apiKey.trim() !== "") {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        const data = await res.json();
        if (data.results && data.results.length > 0 && data.results[0].address_components) {
          const components = data.results[0].address_components as Array<{ types: string[]; long_name: string }>;
          const cityComp = components.find((c) => c.types.includes("locality"));
          const countryComp = components.find((c) => c.types.includes("country"));
          const cityName = cityComp ? cityComp.long_name : null;
          const countryName = countryComp ? countryComp.long_name : null;
          setPickedCity(cityName ? (countryName ? `${cityName}, ${countryName}` : cityName) : (countryName ? `${lat.toFixed(4)}, ${countryName}` : `${lat.toFixed(4)}, ${lng.toFixed(4)}`));
          return;
        }
      } catch {
        // fall through to Nominatim
      }
    }

    // Fallback: free Nominatim reverse geocoding (no API key required)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`,
        { signal: controller.signal, headers: { "Accept-Language": "en" } }
      );
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data && data.address) {
        const { city, town, village, county, state, country } = data.address as Record<string, string>;
        const place = city || town || village || county || state || "";
        setPickedCity(place ? (country ? `${place}, ${country}` : place) : (country || `${lat.toFixed(4)}, ${lng.toFixed(4)}`));
      } else {
        setPickedCity(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch {
      setPickedCity(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  const handleMapClick = (ev: MapMouseEvent) => {
    if (!interactive || !ev.detail?.latLng) return;
    const lat = ev.detail.latLng.lat;
    const lng = ev.detail.latLng.lng;
    setSelectedLat(lat);
    setSelectedLng(lng);
    setPickedCity("");
    setMapError(null);
    reverseGeocode(lat, lng);
    onLocationSelect?.(lat, lng);
  };

  if (mapError) {
    return (
      <div style={{ width: "100%", height: "400px", borderRadius: "12px", overflow: "hidden", background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "var(--text-2)", padding: 20 }}>
          <p style={{ marginBottom: 8 }}>Map temporarily unavailable</p>
          <p style={{ fontSize: "0.85rem", color: "var(--text-3)" }}>Weather data will still load for the selected coordinates.</p>
        </div>
      </div>
    );
  }

  if (apiKey && apiKey.trim() !== "") {
    return (
      <div style={{ width: "100%", height: "400px", borderRadius: "12px", overflow: "hidden" }}>
        <APIProvider apiKey={apiKey} onError={() => setMapError("Map failed to load")}>
          <Map
            defaultCenter={mapCenter}
            center={mapCenter}
            defaultZoom={12}
            onClick={interactive ? handleMapClick : undefined}
            style={{ width: "100%", height: "100%" }}
            gestureHandling={interactive ? "greedy" : "auto"}
            onError={() => setMapError("Map interaction error")}
          >
            <Marker position={markerPosition} />
          </Map>
        </APIProvider>
        {interactive && pickedCity && (
          <div style={{
            position: "absolute",
            bottom: 12,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(15, 23, 42, 0.9)",
            color: "#e2e8f0",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "0.85rem",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 10
          }}>
            {pickedCity}
          </div>
        )}
      </div>
    );
  }

  const query = `${latitude},${longitude}`;
  const mapUrl = `https://maps.google.com/maps?q=${query}&z=12&ie=UTF8&iwloc=&output=embed`;

  return (
    <div style={{ width: "100%", height: "400px", borderRadius: "12px", overflow: "hidden" }}>
      <iframe
        title={`Google Map for ${city}`}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        src={mapUrl}
      />
    </div>
  );
};

export default WeatherMap;