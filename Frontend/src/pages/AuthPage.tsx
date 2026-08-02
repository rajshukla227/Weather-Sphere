import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginUser, registerUser } from "../services/api";
import Navbar from "../components/Navbar";
import { Mail, Lock, User, LogIn, UserPlus, AlertCircle } from "lucide-react";

interface AuthPageProps {
  defaultIsLogin?: boolean;
}

const AuthPage = ({ defaultIsLogin = true }: AuthPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isLogin, setIsLogin] = useState<boolean>(defaultIsLogin);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state with URL path
  useEffect(() => {
    if (location.pathname === "/register") {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
    setError(null);
  }, [location.pathname]);

  const handleTabChange = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setError(null);
    if (loginMode) {
      navigate("/login", { replace: true });
    } else {
      navigate("/register", { replace: true });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await loginUser(email, password);
      } else {
        await registerUser(name, email, password);
      }
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        err.message || 
        (isLogin ? "Invalid email or password" : "Registration failed")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="weather-sphere-app">
      <Navbar />

      <main className="auth-page-container">
        <div className="auth-card">
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${isLogin ? "active" : ""}`}
              onClick={() => handleTabChange(true)}
            >
              <LogIn size={16} />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              className={`auth-tab ${!isLogin ? "active" : ""}`}
              onClick={() => handleTabChange(false)}
            >
              <UserPlus size={16} />
              <span>Register</span>
            </button>
          </div>

          <div className="auth-header">
            <h2>{isLogin ? "Welcome to WeatherSphere" : "Create Your Account"}</h2>
            <p>
              {isLogin 
                ? "Sign in to access your custom dashboard and saved locations" 
                : "Register to track weather history across global cities"}
            </p>
          </div>

          {error && (
            <div className="error-banner">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="auth-input-group">
                <User size={18} className="auth-icon" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  autoComplete="name"
                />
              </div>
            )}

            <div className="auth-input-group">
              <Mail size={18} className="auth-icon" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-input-group">
              <Lock size={18} className="auth-icon" />
              <input
                type="password"
                placeholder={isLogin ? "Password" : "Password (min 6 characters)"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <span className="spinner" />
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="auth-footer-link">
            {isLogin ? (
              <>
                <span>Don't have an account? </span>
                <button type="button" className="link-btn" onClick={() => handleTabChange(false)}>
                  Register
                </button>
              </>
            ) : (
              <>
                <span>Already have an account? </span>
                <button type="button" className="link-btn" onClick={() => handleTabChange(true)}>
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;
