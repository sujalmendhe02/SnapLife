import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { User, Star } from 'lucide-react';
import ProfilePhotoUpload from '../components/ProfilePhotoUpload';

function Profile() {
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [userBlogs, setUserBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    profilePicture: '',
  });

  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
      return;
    }

    // Initialize profile data when user data is available
    setProfileData({
      username: user.username || '',
      profilePicture: user.profilePicture || '',
    });

    const fetchUserBlogs = async () => {
      try {
        const response = await axios.get(`https://snaplife-backend.onrender.com/api/blogs/user/${user.id}`);
        setUserBlogs(response.data);
      } catch (err) {
        setError('Failed to fetch your blogs');
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBlogs();
  }, [user, token, navigate]);

  const handlePhotoSelect = async (file) => {
    if (!file) {
      setProfileData(prev => ({ ...prev, profilePicture: '' }));
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('images', file);

      const uploadResponse = await axios.post(
        'https://snaplife-backend.onrender.com/api/blogs/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      const imageUrl = uploadResponse.data.imageUrls[0];
      
      // Update profile with new photo
      const updateResponse = await axios.put(
        'https://snaplife-backend.onrender.com/api/auth/profile',
        { ...profileData, profilePicture: imageUrl }
      );

      updateUser(updateResponse.data);
      setProfileData(prev => ({ ...prev, profilePicture: imageUrl }));
      setSuccess('Profile photo updated successfully!');
    } catch (err) {
      setError('Failed to upload photo. Please try again.');
      console.error('Photo upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.put(
        'https://snaplife-backend.onrender.com/api/auth/profile',
        profileData
      );

      updateUser(response.data);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-center space-x-4 mb-8">
          <User className="h-12 w-12 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
        </div>

        {(error || success) && (
          <div className={`p-4 rounded-md mb-6 ${
            error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            {error || success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Profile Photo</h3>
              <ProfilePhotoUpload
                currentPhoto={profileData.profilePicture}
                onPhotoSelect={handlePhotoSelect}
                uploading={uploading}
              />
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Statistics</h3>
              <div className="space-y-2">
                <p className="text-gray-600">Total Blogs: {userBlogs.length}</p>
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2">Average Rating:</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= 4
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={profileData.username}
                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                disabled={uploading}
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Update Profile
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Blog Posts</h2>
        {userBlogs.length === 0 ? (
          <p className="text-gray-600">You haven't written any blogs yet.</p>
        ) : (
          <div className="space-y-6">
            {userBlogs.map((blog) => (
              <div key={blog._id} className="border-b border-gray-200 pb-6 last:border-0">
                <h3 className="text-xl font-semibold text-gray-900">{blog.title}</h3>
                <p className="mt-2 text-gray-600">{blog.content.substring(0, 150)}...</p>
                {blog.tags && blog.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {blog.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;