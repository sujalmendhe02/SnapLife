import express from 'express';
import { auth } from '../middleware/auth.js';
import Blog from '../models/Blog.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();
// Get user's blogs
router.get('/user/:userId', async (req, res) => {
  try {
    const blogs = await Blog.find({ 
      author: req.params.userId,
      published: true 
    })
    .populate('author', 'username profilePicture')
    .sort({ createdAt: -1 });
    
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching user blogs:', error);
    res.status(500).json({ message: 'Failed to fetch blogs' });
  }
});

// Get all blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find({ published: true })
      .populate('author', 'username profilePicture')
      .populate('reviews.user', 'username profilePicture')
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get blog by ID
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'username profilePicture')
      .populate('reviews.user', 'username profilePicture')
      .populate('reviews.replies.user', 'username profilePicture');
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create blog
router.post('/', auth, async (req, res) => {
  try {
    const blog = new Blog({
      ...req.body,
      author: req.userId
    });
    await blog.save();
    
    const populatedBlog = await Blog.findById(blog._id)
      .populate('author', 'username profilePicture');
    
    res.status(201).json(populatedBlog);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update blog
router.put('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    if (blog.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    Object.assign(blog, req.body);
    await blog.save();
    
    const updatedBlog = await Blog.findById(blog._id)
      .populate('author', 'username profilePicture')
      .populate('reviews.user', 'username profilePicture');
    
    res.json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete blog
router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    if (blog.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await blog.deleteOne();
    res.json({ message: 'Blog deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload images
router.post('/upload', auth, upload.array('images', 5), async (req, res) => {
  try {
    const imageUrls = req.files.map(file => file.path);
    res.json({ imageUrls });
  } catch (error) {
    res.status(500).json({ message: 'Image upload failed' });
  }
});

// Add review
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const hasReviewed = blog.reviews.some(review => review.user.toString() === req.userId);
    if (hasReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this blog' });
    }

    blog.reviews.push({
      user: req.userId,
      rating: req.body.rating,
      comment: req.body.comment,
      likes: []
    });

    blog.calculateAverageRating();
    await blog.save();

    const updatedBlog = await Blog.findById(req.params.id)
      .populate('author', 'username profilePicture')
      .populate('reviews.user', 'username profilePicture');

    res.json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete review
router.delete('/:blogId/reviews/:reviewId', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const review = blog.reviews.id(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.userId && blog.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    review.remove();
    blog.calculateAverageRating();
    await blog.save();

    const updatedBlog = await Blog.findById(req.params.blogId)
      .populate('author', 'username profilePicture')
      .populate('reviews.user', 'username profilePicture');

    res.json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Like review
router.post('/:blogId/reviews/:reviewId/like', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const review = blog.reviews.id(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const likeIndex = review.likes.indexOf(req.userId);
    if (likeIndex === -1) {
      review.likes.push(req.userId);
    } else {
      review.likes.splice(likeIndex, 1);
    }

    await blog.save();

    const updatedBlog = await Blog.findById(req.params.blogId)
      .populate('author', 'username profilePicture')
      .populate('reviews.user', 'username profilePicture');

    res.json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add reply to review
router.post('/:blogId/reviews/:reviewId/replies', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const review = blog.reviews.id(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.replies.push({
      user: req.userId,
      content: req.body.content,
      likes: []
    });

    await blog.save();

    const updatedBlog = await Blog.findById(req.params.blogId)
      .populate('author', 'username profilePicture')
      .populate('reviews.user', 'username profilePicture')
      .populate('reviews.replies.user', 'username profilePicture');

    res.json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete reply
router.delete('/:blogId/reviews/:reviewId/replies/:replyId', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const review = blog.reviews.id(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const reply = review.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    if (reply.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this reply' });
    }

    reply.remove();
    await blog.save();

    const updatedBlog = await Blog.findById(req.params.blogId)
      .populate('author', 'username profilePicture')
      .populate('reviews.user', 'username profilePicture')
      .populate('reviews.replies.user', 'username profilePicture');

    res.json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Like reply
router.post('/:blogId/reviews/:reviewId/replies/:replyId/like', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const review = blog.reviews.id(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const reply = review.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    const likeIndex = reply.likes.indexOf(req.userId);
    if (likeIndex === -1) {
      reply.likes.push(req.userId);
    } else {
      reply.likes.splice(likeIndex, 1);
    }

    await blog.save();

    const updatedBlog = await Blog.findById(req.params.blogId)
      .populate('author', 'username profilePicture')
      .populate('reviews.user', 'username profilePicture')
      .populate('reviews.replies.user', 'username profilePicture');

    res.json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Search blogs
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const blogs = await Blog.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
      ],
    })
      .populate('author', 'username profilePicture')
      .populate('reviews.user', 'username profilePicture')
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;