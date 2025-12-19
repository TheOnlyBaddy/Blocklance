import { useState, useEffect } from "react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";

export default function MyGigs() {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    image: "",
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user, token } = useAuth();

  // Fetch gigs
  const fetchGigs = async () => {
    try {
      const res = await api.get("/gigs/my-gigs");
      setGigs(Array.isArray(res.data) ? res.data : (res.data?.projects || []));
    } catch (err) {
      console.error("Failed to fetch gigs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGigs();
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
      const res = await api.post("/gigs/upload-image", data);
      setFormData({ ...formData, image: res.data.url });
    } catch (err) {
      alert("Image upload failed!");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || user.role !== "freelancer") {
      alert("Only freelancers can create gigs.");
      return;
    }
    setSubmitting(true);
    try {
      const authToken =
        token ||
        (() => {
          try {
            return (
              window.localStorage.getItem("authToken") ||
              window.localStorage.getItem("bl_token") ||
              window.localStorage.getItem("blocklance_token")
            );
          } catch {
            return null;
          }
        })();
      await api.post("/gigs", formData, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
      });
      alert("Gig created successfully!");
      setShowForm(false);
      setFormData({ title: "", description: "", category: "", price: "", image: "" });
      fetchGigs();
    } catch (err) {
      alert("Gig creation failed!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto w-full p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Gigs</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
        >
          {showForm ? "Cancel" : "+ Create New Gig"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border p-6 mb-10 space-y-4 transition-all duration-300"
        >
          <h2 className="text-xl font-semibold mb-3">Create a New Gig</h2>

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
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              placeholder="Price ($)"
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
            {submitting ? "Submitting..." : "Submit Gig"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500 text-center mt-10">Loading your gigs...</p>
      ) : Array.isArray(gigs) && gigs.length === 0 ? (
        <p className="text-gray-600 text-center mt-10">No gigs yet. Create one!</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.map((gig) => (
            <div
              key={gig._id}
              className="bg-white/60 backdrop-blur-lg p-5 rounded-2xl shadow-md border hover:shadow-xl transition"
            >
              {gig.image && (
                <img
                  src={gig.image}
                  alt={gig.title}
                  className="rounded-lg mb-3 h-40 w-full object-cover"
                />
              )}
              <h3 className="font-semibold text-lg">{gig.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                {gig.description}
              </p>
              <p className="text-blue-500 mt-2 font-medium">${gig.price}</p>
            </div>
          ))}
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
