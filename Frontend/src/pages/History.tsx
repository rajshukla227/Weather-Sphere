import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { Clock, Trash2, MapPin, ChevronRight, AlertCircle } from "lucide-react";

interface SearchItem {
  _id: string;
  city: string;
  country?: string;
  temperature: number;
  condition: string;
  createdAt: string;
}

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/weather/history");
      if (res.data.success) {
        setHistory(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load search history");
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear your search history?")) return;
    try {
      await api.delete("/weather/history");
      setHistory([]);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="weather-sphere-app">
      <Navbar />

      <main className="page-container">
        <div className="page-header">
          <div className="page-title-group">
            <Clock size={28} className="page-icon" />
            <div>
              <h2>My Search History</h2>
              <p>View your recent city weather searches</p>
            </div>
          </div>

          {history.length > 0 && (
            <button type="button" className="danger-btn" onClick={handleClearHistory}>
              <Trash2 size={16} style={{ marginRight: 6 }} />
              Clear History
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <span>Loading search history...</span>
          </div>
        ) : error ? (
          <div className="error-banner">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        ) : history.length === 0 ? (
          <div className="empty-state">
            <Clock size={48} className="empty-icon" />
            <h3>No Search History Yet</h3>
            <p>Cities you search for will automatically be saved to your history here.</p>
          </div>
        ) : (
          <div className="history-list">
            {history.map((item) => (
              <div
                key={item._id}
                className="history-card"
                onClick={() => navigate(`/dashboard?city=${encodeURIComponent(item.city)}`)}
              >
                <div className="history-city-info">
                  <MapPin size={20} className="pin-icon" />
                  <div>
                    <span className="history-city-name">{item.city}</span>
                    {item.country && <span className="history-country">, {item.country}</span>}
                    <div className="history-time">
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="history-weather-side">
                  <span className="history-temp">{Math.round(item.temperature)}°C</span>
                  <span className="history-condition">{item.condition}</span>
                  <ChevronRight size={18} className="chevron-icon" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
