import { useState, useEffect } from "react";
import api from "../lib/api";
import DashboardLayout from "../layouts/DashboardLayout";
import GlassCard from "../components/GlassCard";

export default function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    budget: "",
    image: "",
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects/my-posted-projects");
      setProjects(Array.isArray(res.data) ? res.data : (res.data?.projects || []));
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append("image", file);

    setUploading(true);
    try {
      const res = await api.post("/projects/upload-image", data);
      setFormData({ ...formData, image: res.data.url });
    } catch (err) {
      alert("Image upload failed!");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/projects", formData);
      alert("Project created successfully!");
      setShowForm(false);
      setFormData({ title: "", description: "", category: "", budget: "", image: "" });
      fetchProjects();
    } catch (err) {
      alert("Project creation failed!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Projects</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
        >
          {showForm ? "Cancel" : "+ Create New Project"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border p-6 mb-10 space-y-4 transition-all duration-300"
        >
          <h2 className="text-xl font-semibold mb-3">Create a New Project</h2>

          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Title"
            required
            className="w-full p-2 border rounded-lg"
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            required
            className="w-full p-2 border rounded-lg h-24"
          ></textarea>

          <div className="grid grid-cols-2 gap-4">
            <input
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Category"
              className="w-full p-2 border rounded-lg"
            />
            <input
              name="budget"
              type="number"
              value={formData.budget}
              onChange={handleChange}
              placeholder="Budget ($)"
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {uploading && <p className="text-gray-500 text-sm">Uploading image...</p>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full"
          >
            {submitting ? "Submitting..." : "Submit Project"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500 text-center mt-10">Loading your projects...</p>
      ) : projects.length === 0 ? (
        <p className="text-gray-600 text-center mt-10">No projects yet. Create one!</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div
              key={p._id}
              className="bg-white/60 backdrop-blur-lg p-5 rounded-2xl shadow-md border hover:shadow-xl transition"
            >
              {p.image && (
                <img
                  src={p.image}
                  alt={p.title}
                  className="rounded-lg mb-3 h-40 w-full object-cover"
                />
              )}
              <h3 className="font-semibold text-lg">{p.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                {p.description}
              </p>
              <p className="text-blue-500 mt-2 font-medium">${p.budget}</p>
              <p className="text-xs text-gray-500 italic mt-1">
                {p.category || "Uncategorized"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
      </div>
    </DashboardLayout>
  );
}
