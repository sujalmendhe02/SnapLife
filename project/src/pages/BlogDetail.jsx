import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Calendar, User, Trash2, Edit } from 'lucide-react';
import ReviewSection from '../components/ReviewSection';
import ImageSlider from '../components/ImageSlider';

function BlogDetail() {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`https://snaplife-backend.onrender.com/api/blogs/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBlog(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load blog');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id, token]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;

    try {
      await axios.delete(`https://snaplife-backend.onrender.com/api/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/');
    } catch (err) {
      setError('Failed to delete blog');
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      const response = await axios.post(
        `https://snaplife-backend.onrender.com/api/blogs/${id}/reviews`,
        reviewData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setBlog(response.data);
    } catch (err) {
      setError('Failed to submit review');
    }
  };

  const handleReviewDelete = async (reviewId) => {
    try {
      const response = await axios.delete(
        `https://snaplife-backend.onrender.com/api/blogs/${id}/reviews/${reviewId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setBlog(response.data);
    } catch (err) {
      setError('Failed to delete review');
    }
  };

  const handleReviewLike = async (reviewId) => {
    try {
      const response = await axios.post(
        `https://snaplife-backend.onrender.com/api/blogs/${id}/reviews/${reviewId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setBlog(response.data);
    } catch (err) {
      setError('Failed to like review');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Blog not found</h2>
      </div>
    );
  }

  const isAuthor = user && blog.author && user.id === blog.author._id;

  return (
    <article className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <Link 
              to={`/profile/${blog.author._id}`}
              className="flex items-center space-x-4 group"
            >
              <div className="relative">
                <img
                  src={blog.author.profilePicture || 'https://via.placeholder.com/40'}
                  alt={blog.author.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-indigo-500 transition-colors"></div>
              </div>
              <span className="text-gray-700 group-hover:text-indigo-600 transition-colors">
                {blog.author.username}
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                <Calendar className="h-5 w-5 inline mr-2" />
                {new Date(blog.createdAt).toLocaleDateString()}
              </span>
              {isAuthor && (
                <div className="flex space-x-2">
                 {/* <Link
                    to={`/blog/edit/${blog._id}`}
                    className="p-2 text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <Edit className="h-5 w-5" />
                  </Link>*/}
                  <button
                    onClick={handleDelete}
                    className="p-2 text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">{blog.title}</h1>
          
          {blog.images && blog.images.length > 0 && (
            <ImageSlider images={blog.images} />
          )}

          <div className="prose max-w-none mb-8">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {blog.content}
            </p>
          </div>

          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <ReviewSection
            blog={blog}
            onReviewSubmit={handleReviewSubmit}
            onReviewDelete={handleReviewDelete}
            onReviewLike={handleReviewLike}
          />
        </div>
      </div>
    </article>
  );
}

export default BlogDetail;