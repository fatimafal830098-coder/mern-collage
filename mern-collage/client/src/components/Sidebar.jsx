import React from "react";

export default function Sidebar({ activeTab, setActiveTab, images = [] }) {
  // Favorites ka count nikalne ke liye
  const favoritesCount = images.filter(img => img.isFavorite).length;

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-title">
          <span className="brand-dot"></span>
          <span>FrameBox</span>
        </div>
        <p className="brand-subtitle">MERN Gallery Project</p>
      </div>

      {/* Main Navigation Menu */}
      <nav className="sidebar-nav">
        <div className="menu-group">
          <span className="menu-label">WORKSPACES</span>
          <ul className="menu-list">
            <li
              className={`menu-item ${activeTab === "upload" ? "active" : ""}`}
              onClick={() => setActiveTab("upload")}
            >
              <span className="menu-icon">➕</span> Upload photo
            </li>
          </ul>
        </div>

        <div className="menu-group">
          <span className="menu-label">YOUR COLLECTION</span>
          <ul className="menu-list">
            <li
              className={`menu-item ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              <span className="menu-icon">🖼️</span> All photos 
              <span style={{ marginLeft: "auto", background: "#1f2937", padding: "2px 8px", borderRadius: "10px", fontSize: "0.8rem", color: "#9ca3af" }}>
                {images.length}
              </span>
            </li>
            <li
              className={`menu-item ${activeTab === "favorites" ? "active" : ""}`}
              onClick={() => setActiveTab("favorites")}
            >
              <span className="menu-icon">❤️</span> Favorites 
              <span style={{ marginLeft: "auto", background: "#1f2937", padding: "2px 8px", borderRadius: "10px", fontSize: "0.8rem", color: "#9ca3af" }}>
                {favoritesCount}
              </span>
            </li>
            <li
              className={`menu-item ${activeTab === "recent" ? "active" : ""}`}
              onClick={() => setActiveTab("recent")}
            >
              <span className="menu-icon">🕒</span> Recently added
            </li>
          </ul>
        </div>
      </nav>

      {/* Storage Footer Box */}
      <div className="sidebar-storage">
        <div className="storage-header">
          <span>Storage used</span>
          <span>{images.length} / 100</span>
        </div>
        <div className="storage-bar">
          <div
            className="storage-progress"
            style={{ width: `${Math.min((images.length / 100) * 100, 100)}%` }}
          ></div>
        </div>
        <p className="storage-text">100 items limit per session</p>
      </div>
    </aside>
  );
}