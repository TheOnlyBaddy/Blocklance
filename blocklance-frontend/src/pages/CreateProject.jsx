import { useState } from "react";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";

export default function CreateProject() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    budget: "",
    image: "",
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      console.error("Image upload failed:", err);
      alert("Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/projects", formData);
      alert("✅ Project created successfully!");
      navigate("/dashboard/client/my-projects");
    } catch (err) {
      console.error("Project creation failed:", err);
      alert("❌ Project creation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 grid md:grid-cols-2 gap-10">
      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-white/60 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-gray-100"
      >
        <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">
          Post a New Project
        </h1>

        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
            placeholder="Enter project title"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg h-28 focus:ring focus:ring-blue-300"
            placeholder="Describe your project"
            required
          ></textarea>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Category</label>
            <input
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
              placeholder="e.g., Web Development"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Budget ($)</label>
            <input
              name="budget"
              type="number"
              value={formData.budget}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
              placeholder="Enter your budget"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full"
          />
          {uploading && <p className="text-gray-500 mt-2">Uploading...</p>}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {submitting ? "Submitting..." : "Submit Project"}
        </button>
      </form>

      {/* Live Preview */}
      <div className="bg-white/50 backdrop-blur-lg p-6 rounded-2xl shadow-md border">
        <h2 className="text-xl font-semibold mb-3">Live Preview</h2>
        {formData.image && (
          <img
            src={formData.image}
            alt="Preview"
            className="rounded-lg mb-3 max-h-48 object-cover"
          />
        )}
        <h3 className="text-lg font-medium">{formData.title || "Untitled Project"}</h3>
        <p className="text-gray-600 mt-2">
          {formData.description || "Project description will appear here."}
        </p>
        <p className="text-blue-500 mt-3 font-semibold">
          Budget: ${formData.budget || "0"}
        </p>
        <p className="text-gray-500 mt-1 italic">
          Category: {formData.category || "Not set"}
        </p>
      </div>
    </div>
  );
}
