import { useEffect, useState } from "react";
import API from "../lib/api";

export default function MyProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    username: "",
    bio: "",
    skills: "",
    location: "",
    profileImage: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/users/me");
      setUser(res.data.user);
      setForm({
        username: res.data.user.username || "",
        bio: res.data.user.bio || "",
        skills: res.data.user.skills?.join(", ") || "",
        location: res.data.user.location || "",
        profileImage: res.data.user.profileImage || "",
      });
    } catch (err) {
      console.error("❌ Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedSkills = form.skills.split(",").map((s) => s.trim()).filter(Boolean);
      const res = await API.put("/users/update", { 
        ...form, 
        skills: updatedSkills 
      });
      if (res.status === 200) {
        const updatedUser = res.data.user;
        // Update UI
        setUser(updatedUser);
        setIsEditing(false);
        // Persist in localStorage
        try { window.localStorage.setItem("blocklance_user", JSON.stringify(updatedUser)); } catch {}
        // Notify global listeners (AuthContext) to update navbar immediately
        try { window.dispatchEvent(new CustomEvent("bl_profile_updated", { detail: { user: updatedUser } })); } catch {}
        // Feedback
        alert("✅ Profile updated successfully and saved!");
      }
    } catch (err) {
      console.error("❌ Error updating profile:", err);
      alert("Failed to update profile");
    }
  };

  if (loading) return <p className="p-8 text-gray-500">Loading profile...</p>;
  if (!user)
    return (
      <div className="text-center p-8 text-gray-600">
        <p>Profile not available.</p>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">My Profile</h1>

      <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
        {!isEditing ? (
          <>
            <div className="flex items-center gap-4">
              <img
                src={user.profileImage || "https://via.placeholder.com/100"}
                alt="Profile"
                className="w-24 h-24 rounded-full border"
              />
              <div>
                <h2 className="text-xl font-semibold">{user.username}</h2>
                <p className="text-gray-500">{user.email}</p>
                <span
                  className={`px-3 py-1 rounded text-sm font-semibold ${
                    user.role === "freelancer"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {user.role}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <p><strong>Bio:</strong> {user.bio || "Not added"}</p>
              <p><strong>Skills:</strong> {user.skills?.join(", ") || "Not added"}</p>
              <p><strong>Location:</strong> {user.location || "Not set"}</p>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Edit Profile
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Full Name"
              className="border p-2 rounded w-full"
            />
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Write your bio..."
              className="border p-2 rounded w-full"
            />
            <input
              type="text"
              name="skills"
              value={form.skills}
              onChange={handleChange}
              placeholder="Skills (comma-separated)"
              className="border p-2 rounded w-full"
            />
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Location"
              className="border p-2 rounded w-full"
            />
            <div className="space-y-2">
              <label className="font-medium text-gray-600">Profile Picture</label>
              <div className="flex items-center gap-4">
                <img
                  src={form.profileImage || "https://via.placeholder.com/100"}
                  alt="Profile Preview"
                  className="w-16 h-16 rounded-full border"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append("image", file);

                    try {
                      const res = await API.post("/users/upload-profile", formData);
                      const data = res?.data;
                      if (res.status === 200 && data?.user?.profileImage) {
                        setForm({ ...form, profileImage: data.user.profileImage });
                        alert("✅ Profile image uploaded!");
                      } else {
                        alert("❌ Upload failed: " + (data?.message || 'Unknown error'));
                      }
                    } catch (err) {
                      console.error("Upload error:", err);
                      alert("Something went wrong during upload.");
                    }
                  }}
                  className="border p-2 rounded w-full"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg">
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
