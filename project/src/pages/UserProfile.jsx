import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import UserInfo from '../components/UserInfo';
import BlogCard from '../components/BlogCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [userBlogs, setUserBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const { token } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [userResponse, blogsResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/auth/user/${id}`),
          axios.get(`http://localhost:5000/api/blogs/user/${id}`)
        ]);

        setUserData(userResponse.data);
        setUserBlogs(blogsResponse.data);
        setError('');
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(
          err.response?.data?.message || 
          'Failed to load user profile. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserData();
    }
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!userData) {
    return <ErrorMessage message="User not found" type="warning" />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-8">
          <UserInfo user={userData} />

          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {userBlogs.length > 0 ? 'Blog Posts' : 'No blog posts yet'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userBlogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;