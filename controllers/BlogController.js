const BlogService = require('../services/BlogService');

const createBlog = async (req, res) => {
    try {

        const image = req.files['image'];
        const coverImage = req.files['coverImage'];
        const userId = req.userId;
        const blog = await BlogService.createBlog(userId, req.body, image?.[0] , coverImage?.[0]);
        res.status(201).json(blog);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAllBlogs = async (req, res) => {
    try {
        const blogs = await BlogService.getAllBlogs(req.query);
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

async function getAllBlogsByUser(req, res) {
    const { userId } = req.params;
  
    try {
      const blogs = await BlogService.getAllBlogsByUser(userId);
      res.status(200).json({ success: true, blogs });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
};

const getBlogById = async (req, res) => {
    try {
        const blog = await BlogService.getBlogById(req.params.id);
        if (!blog) {
            res.status(404).json({ error: 'Blog not found' });
            return;
        }
        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateBlog = async (req, res) => {
    try {
        const image = req.files['image'];
        const coverImage = req.files['coverImage'];
        const blog = await BlogService.updateBlog(req.params.id, req.body , image?.[0] , coverImage?.[0]);
        if (!blog) {
            res.status(404).json({ error: 'Blog not found' });
            return;
        }
        res.status(200).json(blog);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteBlog = async (req, res) => {
    try {
        const deletedBlog = await BlogService.deleteBlog(req.params.id);
        if (!deletedBlog) {
            res.status(404).json({ error: 'Blog not found' });
            return;
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

async function getLatestBlogs(req, res) {
    const { limit } = req.params; 
  
    try {
      const blogs = await BlogService.getLatestBlogs(limit);
      res.status(200).json({ success: true, blogs });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
    getAllBlogsByUser,
    getLatestBlogs
};
