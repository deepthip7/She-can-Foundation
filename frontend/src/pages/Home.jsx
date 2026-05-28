import React, { useState } from "react";
import API from "../utils/api";
import "./Home.css";

const SUBJECTS = [
  { value: "mentorship",  label: "Mentorship Program" },
  { value: "volunteer",   label: "Volunteering" },
  { value: "donation",    label: "Donation / Sponsorship" },
  { value: "partnership", label: "Partnership" },
  { value: "other",       label: "Other" },
];

const initial = { name: "", email: "", phone: "", subject: "", message: "", newsletter: false };

const validate = (fields) => {
  const errs = {};
  if (!fields.name.trim() || fields.name.trim().length < 2)
    errs.name = "Name must be at least 2 characters.";
  if (!/^\S+@\S+\.\S+$/.test(fields.email.trim()))
    errs.email = "Please enter a valid email address.";
  if (fields.phone && !/^[\d\s+\-()?]{7,16}$/.test(fields.phone.trim()))
    errs.phone = "Please enter a valid phone number.";
  if (!fields.subject)
    errs.subject = "Please select a topic.";
  if (!fields.message.trim() || fields.message.trim().length < 10)
    errs.message = "Message must be at least 10 characters.";
  return errs;
};

const Home = () => {
  const [form, setForm]       = useState(initial);
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus]   = useState(null); // null | "loading" | "success" | "error"
  const [apiMsg, setApiMsg]   = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    // Clear error on change
    if (errors[name]) setErrors((e) => { const c = {...e}; delete c[name]; return c; });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    const errs = validate(form);
    setErrors(errs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = Object.fromEntries(Object.keys(initial).map(k => [k, true]));
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus("loading");
    try {
      const { data } = await API.post("/submissions", form);
      setApiMsg(data.message);
      setStatus("success");
      setForm(initial);
      setTouched({});
      setErrors({});
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        const mapped = {};
        serverErrors.forEach(e => { mapped[e.field] = e.message; });
        setErrors(mapped);
        setTouched(allTouched);
      }
      setApiMsg(err.response?.data?.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  const fieldClass = (name) =>
    `field-input ${touched[name] && errors[name] ? "invalid" : touched[name] && !errors[name] ? "valid" : ""}`;

  return (
    <div className="home">
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <div className="tag">Empowering Women Everywhere</div>
          <h1>She <em>Can</em>.<br/>She <em>Will</em>.<br/>She <em>Does</em>.</h1>
          <p className="hero-sub">
            Join our mission to empower women through education, mentorship, and community.
            Share your story, ask a question, or simply say hello.
          </p>
          <a href="#contact" className="btn-primary">Get In Touch ↓</a>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="orb orb1" />
          <div className="orb orb2" />
          <div className="orb orb3" />
          <div className="stat-card s1">
            <span className="stat-num">12k+</span>
            <span className="stat-label">Women Empowered</span>
          </div>
          <div className="stat-card s2">
            <span className="stat-num">48</span>
            <span className="stat-label">Countries Reached</span>
          </div>
          <div className="stat-card s3">
            <span className="stat-num">300+</span>
            <span className="stat-label">Mentors</span>
          </div>
        </div>
      </section>

      {/* ── CONTACT FORM ─────────────────────────────────── */}
      <section className="contact-section" id="contact">
        <div className="section-label">Contact Us</div>
        <h2 className="section-title">Let's Start a<br/><em>Conversation</em></h2>

        <div className="form-card">
          {/* Success state */}
          {status === "success" && (
            <div className="alert success" role="alert">
              <span className="alert-icon">✅</span>
              <div>
                <strong>Form Submitted Successfully!</strong>
                <p>{apiMsg}</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {status === "error" && (
            <div className="alert error" role="alert">
              <span className="alert-icon">⚠️</span>
              <p>{apiMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid">
              {/* Name */}
              <div className="field-group">
                <label htmlFor="name">Full Name <span className="req">*</span></label>
                <input
                  id="name" name="name" type="text"
                  className={fieldClass("name")}
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. Priya Sharma"
                  autoComplete="name"
                />
                {touched.name && errors.name && <span className="field-error">{errors.name}</span>}
              </div>

              {/* Email */}
              <div className="field-group">
                <label htmlFor="email">Email Address <span className="req">*</span></label>
                <input
                  id="email" name="email" type="email"
                  className={fieldClass("email")}
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {touched.email && errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              {/* Phone */}
              <div className="field-group">
                <label htmlFor="phone">Phone <span className="optional">(optional)</span></label>
                <input
                  id="phone" name="phone" type="tel"
                  className={fieldClass("phone")}
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                />
                {touched.phone && errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>

              {/* Subject */}
              <div className="field-group">
                <label htmlFor="subject">Subject <span className="req">*</span></label>
                <select
                  id="subject" name="subject"
                  className={fieldClass("subject")}
                  value={form.subject}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option value="">— Choose a topic —</option>
                  {SUBJECTS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                {touched.subject && errors.subject && <span className="field-error">{errors.subject}</span>}
              </div>

              {/* Message */}
              <div className="field-group full">
                <label htmlFor="message">
                  Your Message <span className="req">*</span>
                  <span className="char-count">{form.message.length} / 1000</span>
                </label>
                <textarea
                  id="message" name="message"
                  className={fieldClass("message")}
                  value={form.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={5}
                  maxLength={1000}
                  placeholder="Share your thoughts, questions, or story…"
                />
                {touched.message && errors.message && <span className="field-error">{errors.message}</span>}
              </div>

              {/* Newsletter */}
              <div className="field-group full">
                <label className="checkbox-label">
                  <input
                    type="checkbox" name="newsletter"
                    checked={form.newsletter}
                    onChange={handleChange}
                  />
                  <span className="checkmark">{form.newsletter && "✓"}</span>
                  Subscribe to our newsletter for updates and stories
                </label>
              </div>

              {/* Submit */}
              <div className="field-group full center">
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? (
                    <><span className="spinner" />Sending…</>
                  ) : "Send Message ✦"}
                </button>
                <p className="privacy-note">🔒 Your data is never shared. We respect your privacy.</p>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="footer">
        <span className="brand-icon">✦</span>
        <p>© 2025 She Can Foundation · Built with 💜 · React + Node.js + MongoDB</p>
      </footer>
    </div>
  );
};

export default Home;
