const Blog = require('../models/Blog');

const createBlog = async (blogData) => {
    try {
        const blog = new Blog(blogData);
        return await blog.save();
    } catch (error) {
        throw error;
    }
};

const getAllBlogs = async () => {
    try {
        return await Blog.find().sort({ date: -1 });
    } catch (error) {
        throw error;
    }
};

async function getAllBlogsByUser(userId) {
    try {
      const blogs = await Blog.find({ creator: userId });
      return blogs;
    } catch (error) {
      throw new Error(`Error fetching blogs for user ${userId}: ${error.message}`);
    }
};

const getBlogById = async (blogId) => {
    try {
        return await Blog.findById(blogId);
    } catch (error) {
        throw error;
    }
};

const updateBlog = async (blogId, blogData) => {
    try {
        return await Blog.findByIdAndUpdate(blogId, blogData, { new: true });
    } catch (error) {
        throw error;
    }
};

const deleteBlog = async (blogId) => {
    try {
        return await Blog.findByIdAndDelete(blogId);
    } catch (error) {
        throw error;
    }
};

async function getLatestBlogs(limit) {
    try {
      const blogs = await Blog.find().sort({ date: -1 }).limit(limit);
      return blogs;
    } catch (error) {
      throw new Error(`Error fetching latest blogs: ${error.message}`);
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
