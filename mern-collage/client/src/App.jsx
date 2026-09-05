import { useState, useEffect, useCallback } from "react";
import Gallery from "./components/Gallery";
import UploadForm from "./components/UploadForm";

const API_BASE_URL = "http://localhost:3000/api/images";

export default function App() {
  const [images, setImages] = useState([]);
  const [totalImagesCount, setTotalImagesCount] = useState(0);
  const [search, setSearch] = useState("");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [sort, setSort] = useState("recent");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [editingImage, setEditingImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  const favoritesCount = images.filter(img => img.isFavorite || img.favorite).length;

  const fetchTotalCount = useCallback(async () => {
    try {
      const response = await fetch(API_BASE_URL);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) setTotalImagesCount(data.length);
      }
    } catch (err) {
      console.error("Error fetching total count:", err);
    }
  }, []);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const params = new URLSearchParams();
      if (sort) params.append("sort", sort);
      if (search.trim()) params.append("search", search.trim());
      if (activeTab === "favorites" || favoriteOnly) {
        params.append("favorite", "true");
      }

      const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch images from server");
      
      const data = await response.json();
      const fetchedArray = Array.isArray(data) ? data : [];
      setImages(fetchedArray);

      if (activeTab === "all" && !search.trim()) {
        setTotalImagesCount(fetchedArray.length);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      setErrorMsg("Could not load gallery items. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  }, [search, favoriteOnly, sort, activeTab]);

  useEffect(() => {
    fetchTotalCount();
  }, [fetchTotalCount]);

  useEffect(() => {
    if (activeTab !== "upload" && activeTab !== "settings") {
      fetchImages();
    }
  }, [fetchImages, activeTab]);

  const handleUpload = async (formData) => {
    try {
      const res = await fetch(API_BASE_URL, { method: "POST", body: formData });
      if (res.ok) {
        fetchImages();
        fetchTotalCount();
        setActiveTab("all");
        setFavoriteOnly(false);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || "Upload failed!");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Backend server connection failed!");
    }
  };

  const handleToggleFavorite = async (id, currentFavorite) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${id}/favorite`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !currentFavorite }),
      });
      if (res.ok) {
        fetchImages();
        fetchTotalCount();
      }
    } catch (err) {
      console.error("Favorite toggle failed:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchImages();
        fetchTotalCount();
        setSelectedImageIndex(null);
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleEdit = (img) => setEditingImage(img);

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingImage) return;
    try {
      const tagsArray = typeof editingImage.tags === "string"
        ? editingImage.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : editingImage.tags;

      const res = await fetch(`${API_BASE_URL}/${editingImage._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingImage.title,
          description: editingImage.description,
          tags: tagsArray,
        }),
      });

      if (res.ok) {
        setEditingImage(null);
        fetchImages();
      }
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleNextImage = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const handlePrevImage = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };
  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <div className="brand-title">
              <span className="brand-dot"></span>
              <span>FrameBox</span>
            </div>
            <p className="brand-subtitle">MERN Gallery Upgrade</p>
          </div>

          <nav className="sidebar-nav">
            <div className="menu-group">
              <span className="menu-label">WORKSPACES</span>
              <ul className="menu-list">
                <li
                  className={`menu-item ${activeTab === "all" ? "active" : ""}`}
                  onClick={() => { setActiveTab("all"); setFavoriteOnly(false); }}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <span className="menu-icon">🖼️</span> All photos
                  <span style={{ marginLeft: "auto", background: "#1f2937", padding: "2px 8px", borderRadius: "10px", fontSize: "0.8rem", color: "#9ca3af", fontWeight: "bold" }}>
                    {totalImagesCount}
                  </span>
                </li>
                <li
                  className={`menu-item ${activeTab === "favorites" ? "active" : ""}`}
                  onClick={() => { setActiveTab("favorites"); setFavoriteOnly(true); }}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <span className="menu-icon">❤️</span> Favorites
                  <span style={{ marginLeft: "auto", background: "#1f2937", padding: "2px 8px", borderRadius: "10px", fontSize: "0.8rem", color: "#9ca3af", fontWeight: "bold" }}>
                    {favoritesCount}
                  </span>
                </li>
                <li
                  className={`menu-item ${activeTab === "recent" ? "active" : ""}`}
                  onClick={() => { setActiveTab("recent"); setFavoriteOnly(false); setSort("recent"); }}
                >
                  <span className="menu-icon">🕒</span> Recently added
                </li>
              </ul>
            </div>

            <div className="menu-group">
              <span className="menu-label">STORAGE</span>
              <ul className="menu-list">
                <li
                  className={`menu-item ${activeTab === "upload" ? "active" : ""}`}
                  onClick={() => setActiveTab("upload")}
                >
                  <span className="menu-icon">📤</span> Local upload
                </li>
                <li
                  className={`menu-item ${activeTab === "settings" ? "active" : ""}`}
                  onClick={() => setActiveTab("settings")}
                >
                  <span className="menu-icon">⚙️</span> Settings
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="sidebar-storage">
          <div className="storage-header">
            <span>Storage used</span>
            <span>{totalImagesCount} / 100</span>
          </div>
          <div className="storage-bar">
            <div
              className="storage-progress"
              style={{ width: `${Math.min((totalImagesCount / 100) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="storage-text">100 items limit per session</p>
        </div>
      </aside>

      <main className="main-content">
        <div className="top-toolbar">
          <input
            type="text"
            className="search-input"
            placeholder="Search media by title, description, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="controls-group">
            <button 
              className={`filter-btn ${favoriteOnly ? "active" : ""}`}
              onClick={() => {
                const newFavState = !favoriteOnly;
                setFavoriteOnly(newFavState);
                if (newFavState) setActiveTab("favorites");
                else setActiveTab("all");
              }}
            >
              ❤️ Favorites
            </button>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="sort-select"
            >
              <option value="recent">Recent First</option>
              <option value="oldest">Oldest First</option>
            </select>

            <button className="btn-primary" onClick={() => setActiveTab("upload")}>
              + Upload photo
            </button>
          </div>
        </div>

        {activeTab === "upload" ? (
          <div>
            <div className="section-header"><h2>Local Upload</h2></div>
            <UploadForm onUpload={handleUpload} />
          </div>
        ) : activeTab === "settings" ? (
          <div style={{ maxWidth: "600px", margin: "0 auto", paddingBottom: "40px" }}>
            <div className="section-header">
              <h2>Settings & Preferences</h2>
              <span className="section-subtext">Manage your gallery workspace configuration</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "20px" }}>
              <div style={{ background: "#151d2a", padding: "20px", borderRadius: "12px", border: "1px solid #1f2937" }}>
                <h3 style={{ color: "#fff", fontSize: "1.1rem", marginBottom: "8px" }}>📊 Storage & Quota</h3>
                <p style={{ color: "#9ca3af", fontSize: "0.9rem", marginBottom: "12px" }}>You are currently using {totalImagesCount} out of 100 allowed storage slots in this session.</p>
                <div style={{ background: "#111827", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ background: "#3b82f6", width: `${Math.min((totalImagesCount / 100) * 100, 100)}%`, height: "100%" }}></div>
                </div>
              </div>
              <div style={{ background: "#151d2a", padding: "20px", borderRadius: "12px", border: "1px solid #1f2937" }}>
                <h3 style={{ color: "#fff", fontSize: "1.1rem", marginBottom: "12px" }}>⚙️ Gallery Preferences</h3>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", paddingBottom: "14px", borderBottom: "1px solid #1f2937" }}>
                  <div>
                    <span style={{ color: "#f3f4f6", display: "block", fontWeight: "500" }}>Default Sort Order</span>
                    <span style={{ color: "#9ca3af", fontSize: "0.85rem" }}>Choose how photos appear when opening the gallery</span>
                  </div>
                  <select 
                    value={sort} 
                    onChange={(e) => setSort(e.target.value)}
                    style={{ background: "#111827", color: "#fff", border: "1px solid #374151", padding: "6px 12px", borderRadius: "6px" }}
                  >
                    <option value="recent">Recent First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="section-header">
              <span className="section-subtext">WORKSPACES</span>
              <h2>{activeTab === "favorites" ? "Favorites" : activeTab === "recent" ? "Recently added" : "All photos"}</h2>
            </div>
            {loading ? (
              <div style={{ textAlign: "center", padding: "50px", color: "#9ca3af" }}><p>Loading...</p></div>
            ) : errorMsg ? (
              <div style={{ textAlign: "center", padding: "40px", background: "#1f2937", borderRadius: "12px", marginTop: "20px" }}>
                <p style={{ color: "#fca5a5", marginBottom: "12px" }}>⚠️ {errorMsg}</p>
                <button className="btn-primary" onClick={fetchImages}>Retry</button>
              </div>
            ) : images.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "#111827", borderRadius: "12px", border: "1px dashed #374151", marginTop: "20px" }}>
                <h3 style={{ color: "#f3f4f6", marginBottom: "8px" }}>No items found</h3>
              </div>
            ) : (
              <Gallery 
                images={images} 
                isFiltered={search.length > 0 || favoriteOnly}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onOpen={(index) => setSelectedImageIndex(index)}
              />
            )}
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      {selectedImageIndex !== null && images[selectedImageIndex] && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <button onClick={() => setSelectedImageIndex(null)} style={{ position: "absolute", top: "20px", right: "25px", background: "#374151", color: "#fff", border: "none", width: "40px", height: "40px", borderRadius: "50%", cursor: "pointer", zIndex: 1010 }}>✕</button>
          <button onClick={handlePrevImage} style={{ position: "absolute", left: "20px", background: "rgba(55, 65, 81, 0.8)", color: "#fff", border: "none", width: "50px", height: "50px", borderRadius: "50%", cursor: "pointer", zIndex: 1010 }}>❮</button>
          <div style={{ textAlign: "center", maxWidth: "800px", maxHeight: "90vh" }}>
            <img src={images[selectedImageIndex].imageUrl || images[selectedImageIndex].image} alt={images[selectedImageIndex].title} style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: "8px" }} />
            <h3 style={{ color: "#fff", marginTop: "15px" }}>{images[selectedImageIndex].title}</h3>
          </div>
          <button onClick={handleNextImage} style={{ position: "absolute", right: "20px", background: "rgba(55, 65, 81, 0.8)", color: "#fff", border: "none", width: "50px", height: "50px", borderRadius: "50%", cursor: "pointer", zIndex: 1010 }}>❯</button>
        </div>
      )}

      {/* Edit Popup Modal with Image Preview, Title, Description & Tags */}
      {editingImage && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div style={{ background: "#151d2a", padding: "24px", borderRadius: "12px", width: "380px", border: "1px solid #1f2937", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ color: "#fff", marginBottom: "16px" }}>Edit Photo Details</h3>
            
            {(editingImage.imageUrl || editingImage.image) && (
              <div style={{ marginBottom: "16px", textAlign: "center" }}>
                <img 
                  src={editingImage.imageUrl || editingImage.image} 
                  alt={editingImage.title} 
                  style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "8px", border: "1px solid #374151" }} 
                />
              </div>
            )}

            <form onSubmit={handleSaveEdit}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ color: "#9ca3af", fontSize: "0.8rem", display: "block", marginBottom: "4px" }}>Title</label>
                <input
                  type="text"
                  value={editingImage.title || ""}
                  onChange={(e) => setEditingImage({ ...editingImage, title: e.target.value })}
                  style={{ width: "100%", background: "#111827", color: "#fff", border: "1px solid #1f2937", padding: "8px", borderRadius: "6px" }}
                  required
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ color: "#9ca3af", fontSize: "0.8rem", display: "block", marginBottom: "4px" }}>Description</label>
                <textarea
                  value={editingImage.description || ""}
                  onChange={(e) => setEditingImage({ ...editingImage, description: e.target.value })}
                  style={{ width: "100%", background: "#111827", color: "#fff", border: "1px solid #1f2937", padding: "8px", borderRadius: "6px" }}
                  rows={3}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ color: "#9ca3af", fontSize: "0.8rem", display: "block", marginBottom: "4px" }}>Tags (comma separated)</label>
                <input
                  type="text"
                  value={Array.isArray(editingImage.tags) ? editingImage.tags.join(", ") : editingImage.tags || ""}
                  onChange={(e) => setEditingImage({ ...editingImage, tags: e.target.value })}
                  style={{ width: "100%", background: "#111827", color: "#fff", border: "1px solid #1f2937", padding: "8px", borderRadius: "6px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setEditingImage(null)}
                  style={{ background: "#374151", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: "#3b82f6", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer" }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}