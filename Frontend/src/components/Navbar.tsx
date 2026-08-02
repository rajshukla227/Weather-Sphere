import { Link, useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../services/api";
import { Compass, Clock, Star, LogIn, LogOut, User } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => navigate("/")}>
        <div className="logo-orb" />
        <span className="brand-title">WeatherSphere</span>
      </div>

      <div className="nav-links">
        <Link to="/dashboard" className={`nav-item ${location.pathname === "/dashboard" || location.pathname === "/" ? "active" : ""}`}>
          <Compass size={18} />
          <span>Dashboard</span>
        </Link>
        <Link to="/history" className={`nav-item ${location.pathname === "/history" ? "active" : ""}`}>
          <Clock size={18} />
          <span>History</span>
        </Link>
        <Link to="/saved-locations" className={`nav-item ${location.pathname === "/saved-locations" ? "active" : ""}`}>
          <Star size={18} />
          <span>Saved</span>
        </Link>
      </div>

      <div className="nav-user">
        {user ? (
          <div className="user-profile-badge">
            <User size={16} />
            <span className="user-name">{user.name}</span>
            <button type="button" className="nav-logout-btn" onClick={handleLogout} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="nav-auth-buttons">
            <Link to="/login" className="nav-login-btn">
              <LogIn size={16} style={{ marginRight: 4 }} />
              Login
            </Link>
            <Link to="/register" className="nav-register-btn">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
