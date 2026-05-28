import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]     = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiErr, setApiErr] = useState("");

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => { const c = {...er}; delete c[e.target.name]; return c; });
    setApiErr("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.email) errs.email = "Email is required.";
    if (!form.password) errs.password = "Password is required.";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const result = await login(form.email, form.password);
    if (result.success) {
      navigate("/admin");
    } else {
      setApiErr(result.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon">🔐</div>
        <h2 className="login-title">Admin Login</h2>
        <p className="login-sub">Access the dashboard to view all form submissions.</p>

        {apiErr && (
          <div className="alert-login error" role="alert">❌ {apiErr}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <label htmlFor="loginEmail">Email</label>
            <input
              id="loginEmail" name="email" type="email"
              className={`field-input ${errors.email ? "invalid" : ""}`}
              value={form.email}
              onChange={handleChange}
              placeholder="admin@shecan.org"
              autoComplete="email"
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="field-group">
            <label htmlFor="loginPassword">Password</label>
            <input
              id="loginPassword" name="password" type="password"
              className={`field-input ${errors.password ? "invalid" : ""}`}
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? <><span className="spinner" />Logging in…</> : "Login →"}
          </button>
        </form>

        <p className="hint">
          Demo: <code>admin@shecan.org</code> / <code>shecan2025</code><br/>
          <small>(Run <code>POST /api/auth/seed</code> first to create the admin)</small>
        </p>
      </div>
    </div>
  );
};

export default Login;
