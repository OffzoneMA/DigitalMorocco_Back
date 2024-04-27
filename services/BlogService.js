const Blog = require('../models/Blog');
const uploadService = require('./FileService');


const createBlog = async (userId, blogData , imageData) => {
    try {
        const blog = new Blog({creator: userId, ...blogData});

        if (imageData) {
            const logoURL = await uploadService.uploadFile(imageData, 'Blogs/' + userId + "/images/", imageData.originalname);
            blog.image = logoURL;
        }
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

 const  getAllBlogsByUser = async (userId) => {
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

const updateBlog = async (blogId, blogData, imageData) => {
    try {
        const blog = await Blog.findById(blogId);
        if (!blog) {
            throw new Error('Blog not found');
        }
        
        if (imageData) {
            const imageURL = await uploadService.uploadFile(imageData, 'Blogs/' + blog.creator + "/images/", imageData.originalname);
            blog.image = imageURL;
        }

        blog.title = blogData.title || blog.title;
        blog.resume = blogData.resume || blog.resume;
        blog.details = blogData.details || blog.details;
        blog.content = blogData.content || blog.content;
        blog.tags = blogData.tags || blog.tags;

        return await blog.save();
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

const  getLatestBlogs = async (limit) => {
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
