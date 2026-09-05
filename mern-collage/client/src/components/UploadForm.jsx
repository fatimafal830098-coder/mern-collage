import { useState } from "react";

export default function UploadForm({ onUpload, busy }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select an image file.");
    if (!title.trim()) return alert("Title is required.");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("tags", tags);

    // Main App component function call
    if (onUpload) {
      await onUpload(formData);
    }

    // Success hone par hi clear karein
    setFile(null);
    setTitle("");
    setDescription("");
    setTags("");
  };

  return (
    <div className="upload-card-container">
      <form onSubmit={handleSubmit}>
        
        {/* Modern Drag & Drop / Select Box */}
        <div className="upload-form-group">
          <label className="upload-label">
            SELECT IMAGE FILE <span>*</span>
          </label>
          <div className="file-drop-zone">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0] || null)}
              disabled={busy}
              required={!file}
            />
            <span className="drop-zone-icon">📁</span>
            {file ? (
              <p className="file-selected-name">Selected: {file.name}</p>
            ) : (
              <>
                <p className="drop-zone-text">Click to choose image or drag & drop</p>
                <p className="drop-zone-subtext">PNG, JPG, WEBP or GIF supported</p>
              </>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="upload-form-group">
          <label className="upload-label">
            TITLE (1-80 CHARS) <span>*</span>
          </label>
          <input
            type="text"
            className="upload-input"
            placeholder="e.g., Mountain Sunset"
            value={title}
            maxLength={80}
            onChange={(e) => setTitle(e.target.value)}
            disabled={busy}
            required
          />
        </div>

        {/* Description */}
        <div className="upload-form-group">
          <label className="upload-label">DESCRIPTION (MAX 240 CHARS)</label>
          <textarea
            className="upload-textarea"
            placeholder="Brief description of the photo..."
            value={description}
            maxLength={240}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            disabled={busy}
          />
        </div>

        {/* Tags */}
        <div className="upload-form-group">
          <label className="upload-label">TAGS (COMMA SEPARATED)</label>
          <input
            type="text"
            className="upload-input"
            placeholder="nature, sunset, mountains"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            disabled={busy}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-upload-submit"
          disabled={busy}
          style={{ marginTop: "10px" }}
        >
          {busy ? "Uploading Image..." : "📤 Upload Photo"}
        </button>
      </form>
    </div>
  );
}