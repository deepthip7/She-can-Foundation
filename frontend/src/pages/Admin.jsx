import React, { useState, useEffect, useCallback } from "react";
import API from "../utils/api";
import "./Admin.css";

const SUBJECTS = ["mentorship", "volunteer", "donation", "partnership", "other"];
const STATUSES = ["new", "read", "replied"];

const Admin = () => {
  const [submissions, setSubmissions] = useState([]);
  const [stats,       setStats]       = useState({});
  const [pagination,  setPagination]  = useState({});
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");

  // Filters / sort / pagination state
  const [search,  setSearch]  = useState("");
  const [subject, setSubject] = useState("");
  const [status,  setStatus]  = useState("");
  const [sort,    setSort]    = useState("-createdAt");
  const [page,    setPage]    = useState(1);

  // Modal
  const [modal, setModal] = useState(null);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await API.get("/submissions", {
        params: { page, limit: 10, search, subject, status, sort },
      });
      setSubmissions(data.data);
      setStats(data.stats);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  }, [page, search, subject, status, sort]);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleSort = (key) => {
    setSort(s => s === `-${key}` ? key : `-${key}`);
    setPage(1);
  };

  const sortIcon = (key) => {
    if (sort === `-${key}`) return " ↓";
    if (sort === key)       return " ↑";
    return " ⇅";
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.patch(`/submissions/${id}/status`, { status: newStatus });
      fetchSubmissions();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this submission?")) return;
    try {
      await API.delete(`/submissions/${id}`);
      fetchSubmissions();
    } catch { alert("Delete failed."); }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Delete ALL submissions? This cannot be undone.")) return;
    try {
      await API.delete("/submissions");
      fetchSubmissions();
    } catch { alert("Failed to clear all."); }
  };

  const exportCSV = () => {
    if (!submissions.length) { alert("No data to export."); return; }
    const headers = ["Name","Email","Phone","Subject","Message","Newsletter","Status","Submitted At"];
    const rows = submissions.map(s => [
      s.name, s.email, s.phone||"", s.subject,
      `"${s.message.replace(/"/g,'""')}"`,
      s.newsletter?"Yes":"No", s.status,
      new Date(s.createdAt).toLocaleString()
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], {type:"text/csv"}));
    const a = document.createElement("a"); a.href = url; a.download = "shecan_submissions.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Admin Panel</h1>
          <p className="admin-sub">Manage all contact form submissions</p>
        </div>
        <div className="admin-actions">
          <input
            type="text" placeholder="🔍  Search…" className="search-input"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
          <select className="filter-select" value={subject} onChange={e => { setSubject(e.target.value); setPage(1); }}>
            <option value="">All Topics</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="filter-select" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn-outline-sm" onClick={exportCSV}>⬇ CSV</button>
          <button className="btn-danger-sm" onClick={handleClearAll}>🗑 Clear All</button>
        </div>
      </div>

      {/* Stats */}
      {stats.total !== undefined && (
        <div className="stats-row">
          <div className="stat-chip"><strong>{stats.total}</strong><span>Total</span></div>
          <div className="stat-chip"><strong>{stats.newsletter || 0}</strong><span>Newsletter</span></div>
          {SUBJECTS.map(s => (
            <div className="stat-chip" key={s}>
              <strong>{stats.bySubject?.[s] || 0}</strong>
              <span className={`pill ${s}`}>{s}</span>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && <div className="alert-admin error">{error}</div>}

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading submissions…</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="empty-state">
            <span>📭</span>
            <p>No submissions found.</p>
          </div>
        ) : (
          <table className="sub-table">
            <thead>
              <tr>
                <th>#</th>
                <th onClick={() => handleSort("name")} className="sortable">Name{sortIcon("name")}</th>
                <th onClick={() => handleSort("email")} className="sortable">Email{sortIcon("email")}</th>
                <th onClick={() => handleSort("subject")} className="sortable">Subject{sortIcon("subject")}</th>
                <th>Message</th>
                <th>Newsletter</th>
                <th onClick={() => handleSort("status")} className="sortable">Status{sortIcon("status")}</th>
                <th onClick={() => handleSort("createdAt")} className="sortable">Date{sortIcon("createdAt")}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s, i) => (
                <tr key={s._id}>
                  <td>{(pagination.page - 1) * 10 + i + 1}</td>
                  <td><strong>{s.name}</strong></td>
                  <td className="td-email">{s.email}</td>
                  <td><span className={`pill ${s.subject}`}>{s.subject}</span></td>
                  <td><span className="msg-preview">{s.message}</span></td>
                  <td className="td-center">{s.newsletter ? "✅" : "—"}</td>
                  <td>
                    <select
                      className={`status-select ${s.status}`}
                      value={s.status}
                      onChange={e => handleStatusChange(s._id, e.target.value)}
                    >
                      {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </td>
                  <td>{formatDate(s.createdAt)}</td>
                  <td className="td-actions">
                    <button className="btn-view" onClick={() => setModal(s)}>View</button>
                    <button className="btn-del" onClick={() => handleDelete(s._id)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="page-btn">← Prev</button>
          <span className="page-info">Page {pagination.page} of {pagination.pages}</span>
          <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} className="page-btn">Next →</button>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            <h3 className="modal-name">{modal.name}</h3>
            <p className="modal-email">{modal.email}{modal.phone ? ` · ${modal.phone}` : ""}</p>
            <div className="modal-tags">
              <span className={`pill ${modal.subject}`}>{modal.subject}</span>
              <span className={`pill status-pill ${modal.status}`}>{modal.status}</span>
              {modal.newsletter && <span className="pill other">📧 Newsletter</span>}
            </div>
            <div className="modal-message">{modal.message}</div>
            <p className="modal-date">
              Submitted {new Date(modal.createdAt).toLocaleString("en-IN", {
                day:"numeric", month:"long", year:"numeric", hour:"2-digit", minute:"2-digit"
              })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
