import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
export const getImages = (params = {}) =>
  axios.get(`${API}/images`, { params }).then((r) => r.data);
export const deleteImage = (id) =>
  axios.delete(`${API}/images/${id}`).then((r) => r.data);
export const uploadImage = ({ file, title, description, tags }) => {
  const form = new FormData();
  form.append("image", file);
  if (title) form.append("title", title);
  if (description) form.append("description", description);
  if (tags) form.append("tags", tags);

  return axios.post(`${API}/images`, form).then((r) => r.data);
};
export const updateImage = (id, data) =>
  axios.patch(`${API}/images/${id}`, data).then((r) => r.data);
export const toggleFavorite = (id, isFavorite) =>
  axios
    .patch(`${API}/images/${id}/favorite`, { isFavorite })
    .then((r) => r.data);