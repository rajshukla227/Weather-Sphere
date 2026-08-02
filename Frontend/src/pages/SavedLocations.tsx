import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { Star, Trash2, MapPin, ChevronRight, AlertCircle } from "lucide-react";

interface SavedItem {
  _id: string;
  city: string;
  country?: string;
  temperature: number;
  condition: string;
  createdAt: string;
}

const SavedLocations = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedLocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/weather/saved");
      if (res.data.success) {
        setLocations(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load saved locations");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (e: React.MouseEvent, city: string) => {
    e.stopPropagation();
    try {
      await api.delete(`/weather/saved/${encodeURIComponent(city)}`);
      setLocations((prev) => prev.filter((item) => item.city !== city));
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSavedLocations();
  }, []);

  return (
    <div className="weather-sphere-app">
      <Navbar />

      <main className="page-container">
        <div className="page-header">
          <div className="page-title-group">
            <Star size={28} className="page-icon star-icon-active" />
            <div>
              <h2>Saved Locations</h2>
              <p>Quick access to your favorite locations</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <span>Loading saved locations...</span>
          </div>
        ) : error ? (
          <div className="error-banner">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        ) : locations.length === 0 ? (
          <div className="empty-state">
            <Star size={48} className="empty-icon" />
            <h3>No Saved Locations Yet</h3>
            <p>Click the ⭐ <strong>Save Location</strong> button on any city in Dashboard to pin it here.</p>
          </div>
        ) : (
          <div className="saved-grid">
            {locations.map((item) => (
              <div
                key={item._id}
                className="saved-card"
                onClick={() => navigate(`/dashboard?city=${encodeURIComponent(item.city)}`)}
              >
                <div className="saved-card-header">
                  <div className="saved-city">
                    <MapPin size={20} className="pin-icon" />
                    <h4>{item.city}{item.country ? `, ${item.country}` : ""}</h4>
                  </div>

                  <button
                    type="button"
                    className="icon-btn-remove"
                    onClick={(e) => handleRemove(e, item.city)}
                    title="Remove from saved"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="saved-card-body">
                  <span className="saved-temp">{Math.round(item.temperature)}°C</span>
                  <span className="saved-condition">{item.condition}</span>
                </div>

                <div className="saved-card-footer">
                  <span>View Details</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SavedLocations;
