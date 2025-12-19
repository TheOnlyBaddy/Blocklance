import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const MyProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    skills: "",
    location: "",
    socials: { 
      github: "", 
      linkedin: "", 
      website: ""
    },
    profileImage: ""
  });
  
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/me");
        const userData = res.data;
        setProfile({
          name: userData.name || "",
          email: userData.email || "",
          bio: userData.bio || "",
          skills: Array.isArray(userData.skills) ? userData.skills.join(", ") : userData.skills || "",
          location: userData.location || "",
          socials: userData.socials || { github: "", linkedin: "", website: "" },
          profileImage: userData.profileImage || ""
        });
        setImagePreview(userData.profileImage || "");
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // Handle social links changes
  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      socials: { ...prev.socials, [name]: value }
    }));
  };

  // Handle profile image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Save profile changes
  const saveChanges = async () => {
    try {
      setSaving(true);
      setError("");
      
      // Update text fields
      await api.put("/users/update", {
        name: profile.name,
        bio: profile.bio,
        skills: profile.skills.split(',').map(s => s.trim()).filter(Boolean),
        location: profile.location,
        socials: profile.socials
      });

      // Upload image if changed
      if (imageFile) {
        const formData = new FormData();
        formData.append("profileImage", imageFile);
        
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        
        const uploadClient = axios.create({
          baseURL: API_BASE_URL,
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        uploadClient.defaults.headers.post['Content-Type'] = undefined;
        
        const res = await uploadClient.post('/users/upload-profile', formData);
        
        // Update profile with new image URL
        const imageUrl = res.data?.imageUrl || res.data?.url;
        if (imageUrl) {
          const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
          setProfile(prev => ({ ...prev, profileImage: fullImageUrl }));
        }
      }
      
      setEditMode(false);
      
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="mt-3 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-3 sm:mt-0">
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={saveChanges}
                    disabled={saving}
                    className={`px-4 py-2 rounded-lg text-white flex items-center justify-center space-x-2 ${
                      saving ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                    } transition-colors duration-200`}
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <img
                  src={imagePreview || profile.profileImage || '/default-avatar.png'}
                  alt="Profile"
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white shadow-lg"
                />
                {editMode && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <label className="bg-white bg-opacity-80 p-2 rounded-full cursor-pointer hover:bg-opacity-100 transition-all duration-200">
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleImageChange}
                        accept="image/*"
                      />
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </label>
                  </div>
                )}
              </div>
              {editMode && imagePreview && (
                <p className="mt-2 text-sm text-gray-500">New image selected. Click "Save Changes" to update.</p>
              )}
            </div>

            {/* Profile Form */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.name || <span className="text-gray-400">Not provided</span>}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{profile.email || <span className="text-gray-400">No email</span>}</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="location"
                      value={profile.location}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="City, Country"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {profile.location || <span className="text-gray-400">Not provided</span>}
                    </p>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">About Me</label>
                {editMode ? (
                  <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-900 whitespace-pre-line">
                    {profile.bio || <span className="text-gray-400">No bio provided</span>}
                  </p>
                )}
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Skills</label>
                {editMode ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="skills"
                      value={profile.skills}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="e.g., React, Node.js, UI/UX Design"
                    />
                    <p className="text-xs text-gray-500">Separate skills with commas</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills ? (
                      profile.skills.split(',').filter(skill => skill.trim()).map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                          {skill.trim()}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-400">No skills added</p>
                    )}
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Social Links</h3>
                
                {/* GitHub */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">GitHub</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 py-2 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      github.com/
                    </span>
                    <input
                      name="github"
                      value={profile.socials.github || ""}
                      onChange={handleSocialChange}
                      disabled={!editMode}
                      className={`flex-1 min-w-0 block w-full px-4 py-2 rounded-r-lg border ${
                        editMode ? 'border-gray-300' : 'border-transparent bg-gray-50'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                      placeholder="username"
                    />
                  </div>
                </div>

                {/* LinkedIn */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 py-2 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      linkedin.com/in/
                    </span>
                    <input
                      name="linkedin"
                      value={profile.socials.linkedin || ""}
                      onChange={handleSocialChange}
                      disabled={!editMode}
                      className={`flex-1 min-w-0 block w-full px-4 py-2 rounded-r-lg border ${
                        editMode ? 'border-gray-300' : 'border-transparent bg-gray-50'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                      placeholder="username"
                    />
                  </div>
                </div>

                {/* Website */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Website</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 py-2 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      https://
                    </span>
                    <input
                      name="website"
                      value={profile.socials.website || ""}
                      onChange={handleSocialChange}
                      disabled={!editMode}
                      className={`flex-1 min-w-0 block w-full px-4 py-2 rounded-r-lg border ${
                        editMode ? 'border-gray-300' : 'border-transparent bg-gray-50'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                      placeholder="yourwebsite.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfilePage;