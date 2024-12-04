import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Calendar, User } from 'lucide-react';
import StarRating from '../components/StarRating';
import SearchBar from '../components/SearchBar';

function Home() {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useAuth(); // Assuming `token` is available from context

  // Fetch blogs from API
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/blogs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const blogsData = response.data;
        setBlogs(blogsData);
        setFilteredBlogs(blogsData);
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError('Failed to load blogs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [token]);

  // Handle search functionality
  const handleSearch = (query) => {
    const lowercaseQuery = query.toLowerCase();
    const filtered = blogs.filter((blog) =>
      blog.title.toLowerCase().includes(lowercaseQuery) ||
      blog.author?.username?.toLowerCase().includes(lowercaseQuery) ||
      blog.content.toLowerCase().includes(lowercaseQuery)
    );
    setFilteredBlogs(filtered);
  };

  // Loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Main component rendering
  return (
    <div className="space-y-8">
      <header className="text-center space-y-4 mt-10">
        <h1 className="text-4xl font-bold text-gray-900">Welcome to SnapLife</h1>
        <p className="text-xl text-gray-600">Share your stories with stunning visuals</p>
      </header>

      <SearchBar onSearch={handleSearch} />

      {error && (
        <div className="text-center py-4">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {filteredBlogs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">No blogs available yet. Be the first to create one!</p>
          {user && (
            <Link
              to="/create"
              className="inline-block mt-4 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Create Blog
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBlogs.map((blog) => (
            <Link
              key={blog._id}
              to={`/blog/${blog._id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {blog.images && blog.images[0] ? (
                <img
                  src={blog.images[0]}
                  alt={blog.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}

              <div className="p-6 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 line-clamp-2">
                  {blog.title}
                </h2>
                <p className="text-gray-600 line-clamp-3">{blog.content}</p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <Link
                    to={`/profile/${blog.author?._id}`}
                    className="flex items-center space-x-2 hover:text-indigo-600"
                  >
                    <User className="h-4 w-4" />
                    <span>{blog.author?.username || 'Anonymous'}</span>
                  </Link>

                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {blog.averageRating > 0 && (
                  <div className="flex items-center space-x-2">
                    <StarRating rating={blog.averageRating} size={16} />
                    <span className="text-sm text-gray-500">
                      ({blog.reviews?.length || 0} reviews)
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
