import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard.jsx';
import api from '../lib/api';

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const isCurrentUser = !id; // If no ID in URL, it's the current user's profile

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const endpoint = id ? `/api/users/${id}` : '/api/users/me';
      const res = await api.get(endpoint);
      setUser(res.data);
    } catch (err) {
      console.error('❌ Error fetching profile:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!isCurrentUser) return;
    
    try {
      setSaving(true);
      const res = await api.patch('/api/users/update', {
        username: user.username,
        bio: user.bio,
        skills: user.skills,
      });
      setUser(res.data);
      setEditMode(false);
      // Show success message (you can replace this with a toast notification)
      alert('✅ Profile updated successfully!');
    } catch (err) {
      console.error('❌ Profile update failed:', err);
      alert('Error updating profile: ' + (err.response?.data?.message || 'Please try again'));
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      setImageUploading(true);
      const res = await api.patch('/api/users/upload-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser(res.data);
      alert('✅ Profile picture updated!');
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('❌ Failed to upload image. ' + (err.response?.data?.message || 'Please try again.'));
    } finally {
      setImageUploading(false);
    }
  };

  if (loading) return <div className="text-center mt-8">Loading profile...</div>;
  if (!user) return <div className="text-center mt-8 text-red-500">User not found</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">
            {isCurrentUser ? 'My Profile' : `${user.username}'s Profile`}
          </h2>
          {isCurrentUser && (
            <label className="relative cursor-pointer group">
              <div className="relative">
                <img
                  src={user.profileImage || '/default-avatar.png'}
                  alt={user.username}
                  className="w-16 h-16 rounded-full border-2 border-white dark:border-gray-700 object-cover hover:opacity-90 transition-opacity"
                />
                {imageUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
                <div className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1.5 group-hover:bg-blue-700 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={imageUploading || !isCurrentUser}
              />
            </label>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Username</label>
            {editMode ? (
              <input
                type="text"
                name="username"
                value={user.username || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
              />
            ) : (
              <p className="text-lg">{user.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Bio</label>
            {editMode ? (
              <textarea
                name="bio"
                value={user.bio || ''}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
              />
            ) : (
              <p className="whitespace-pre-line">{user.bio || 'No bio added yet.'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Skills</label>
            {editMode ? (
              <input
                type="text"
                name="skills"
                value={user.skills || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="e.g., React, Node.js, Solidity"
              />
            ) : (
              <p>{user.skills || 'No skills added yet.'}</p>
            )}
          </div>

          {isCurrentUser && (
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
              {editMode ? (
                <>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 rounded-lg bg-gray-400 text-white hover:bg-gray-500 transition-colors"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`px-4 py-2 rounded-lg text-white ${
                      saving ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'
                    } transition-colors`}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
