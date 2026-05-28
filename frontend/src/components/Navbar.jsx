import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <span className="brand-icon">✦</span>
        <span>She Can Foundation</span>
      </Link>

      <div className="nav-links">
        <Link to="/" className={isActive("/") ? "active" : ""}>Home</Link>

        {isLoggedIn ? (
          <>
            <Link to="/admin" className={`nav-link ${isActive("/admin") ? "active" : ""}`}>
              Admin Panel
            </Link>
            <span className="admin-badge">Admin</span>
            <button className="btn-small" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Link to="/login" className="btn-outline-small">Admin Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
