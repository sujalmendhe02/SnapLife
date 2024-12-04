import { Link } from 'react-router-dom';
import { Calendar, Star } from 'lucide-react';

function BlogCard({ blog }) {
  return (
    <Link
      to={`/blog/${blog._id}`}
      className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
    >
      {blog.images && blog.images[0] && (
        <img
          src={blog.images[0]}
          alt={blog.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{blog.title}</h3>
        <p className="text-gray-600 line-clamp-2">{blog.content}</p>
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
          </div>
          {blog.averageRating > 0 && (
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400" />
              <span>{blog.averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default BlogCard;