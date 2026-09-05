import { useEffect } from "react";

export default function Viewer({
  images,
  index,
  onClose,
  onChange,
  onDelete,
  onToggleFavorite,
  onEdit,
}) {
  const currentImg = images[index];

  // Keyboard navigation (Arrow keys + Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [index, images.length]);

  if (!currentImg) return null;

  const handleNext = () => {
    onChange((index + 1) % images.length);
  };

  const handlePrev = () => {
    onChange((index - 1 + images.length) % images.length);
  };

  return (
    <div className="viewer-overlay" onClick={onClose}>
      <div className="viewer-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Close viewer">
          ✕
        </button>

        <div className="viewer-layout">
          {/* Left Column: Image Preview with Nav Arrows */}
          <div className="viewer-media-wrapper">
            {images.length > 1 && (
              <button className="nav-btn prev-btn" onClick={handlePrev} aria-label="Previous image">
                ‹
              </button>
            )}

            <div className="viewer-img-container">
              <img
                src={currentImg.imageUrl}
                alt={currentImg.title || "Full view"}
                className="viewer-img"
              />
            </div>

            {images.length > 1 && (
              <button className="nav-btn next-btn" onClick={handleNext} aria-label="Next image">
                ›
              </button>
            )}
            
            <span className="viewer-counter">
              {index + 1} of {images.length}
            </span>
          </div>

          {/* Right Column: Metadata & Details Panel */}
          <div className="viewer-sidebar">
            <div className="viewer-header-row">
              <h3>{currentImg.title || "Untitled Image"}</h3>
              {onToggleFavorite && (
                <button
                  className="fav-btn"
                  onClick={() => onToggleFavorite(currentImg._id, currentImg.isFavorite)}
                  title={currentImg.isFavorite ? "Remove Favorite" : "Add Favorite"}
                >
                  {currentImg.isFavorite ? "❤️" : "🤍"}
                </button>
              )}
            </div>

            <div className="viewer-description">
              <p>{currentImg.description || "No description provided."}</p>
            </div>

            {currentImg.tags && currentImg.tags.length > 0 && (
              <div className="viewer-tags">
                {currentImg.tags.map((tag, idx) => (
                  <span key={idx} className="tag-chip">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions Block */}
            <div className="viewer-actions">
              {onEdit && (
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    onClose();
                    onEdit(currentImg);
                  }}
                >
                  Edit Details ✏️
                </button>
              )}

              <button className="btn btn-danger" onClick={() => onDelete(currentImg._id)}>
                Delete Image 🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}