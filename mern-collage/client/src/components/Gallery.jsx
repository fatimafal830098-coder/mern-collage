export default function Gallery({ images, onOpen, onDelete, onToggleFavorite, onEdit, isFiltered }) {
  if (!images || images.length === 0) {
    return (
      <div className="empty-state">
        <h4>{isFiltered ? "No matching images found" : "No photos in gallery"}</h4>
        <p>{isFiltered ? "Try clearing your search query." : "Upload an image above to start."}</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "30px" }}>
      <h2 style={{ marginBottom: "16px", fontSize: "1.2rem", color: "#f3f4f6" }}>All Photos</h2>
      <div className="grid">
        {images.map((img, index) => (
          <div key={img._id || index} className="card">
            <div className="card-img-wrapper" onClick={() => onOpen(index)}>
              <img src={img.imageUrl || img.url} alt={img.title || "Gallery Item"} />
              <button
                type="button"
                className="favorite-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(img._id, img.isFavorite || img.favorite);
                }}
              >
                {img.isFavorite || img.favorite ? "❤️" : "🤍"}
              </button>
            </div>

            <div className="card-body">
              <h4 className="card-item-title">{img.title || "Untitled"}</h4>
              <p className="card-description">{img.description || "No description provided."}</p>

              {img.tags && img.tags.length > 0 && (
                <div className="card-tags">
                  {img.tags.map((tag, idx) => (
                    <span key={idx} className="card-tag">#{tag}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="card-footer">
              <span className="card-date">
                {img.createdAt ? new Date(img.createdAt).toLocaleDateString() : ""}
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                  onClick={() => onEdit(img)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: "4px 8px", fontSize: "0.8rem", backgroundColor: "#ef4444", color: "#fff", borderColor: "#ef4444" }}
                  onClick={() => onDelete(img._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}