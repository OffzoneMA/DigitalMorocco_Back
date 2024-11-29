// __tests__/blogService.test.js
const Blog = require('../models/Blog');
const uploadService = require('../services/FileService');
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  getAllBlogsByUser,
  getLatestBlogs,
} = require('../services/BlogService');

// Mocking dependencies
jest.mock('../models/Blog');
jest.mock('../services/FileService');

describe('Blog Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBlog', () => {
    it('should create a new blog with images and coverImage', async () => {
      const blogData = { title: 'New Blog', content: 'Blog content' };
      const imageData = { originalname: 'image.png' };
      const coverImage = { originalname: 'cover.png' };
      const userId = 'user123';
      const mockBlog = { save: jest.fn().mockResolvedValue(blogData) };

      Blog.mockImplementation(() => mockBlog);
      uploadService.uploadFile
        .mockResolvedValueOnce('image_url')
        .mockResolvedValueOnce('cover_image_url');

      const result = await createBlog(userId, blogData, imageData, coverImage);

      expect(uploadService.uploadFile).toHaveBeenCalledWith(
        imageData,
        `Blogs/${userId}/images/`,
        imageData.originalname
      );
      expect(uploadService.uploadFile).toHaveBeenCalledWith(
        coverImage,
        `Blogs/${userId}/images/`,
        coverImage.originalname
      );
      expect(mockBlog.image).toEqual('image_url');
      expect(mockBlog.coverImage).toEqual('cover_image_url');
      expect(mockBlog.save).toHaveBeenCalled();
      expect(result).toEqual(blogData);
    });

    it('should create a new blog without images if no image data is provided', async () => {
      const blogData = { title: 'New Blog', content: 'Blog content' };
      const userId = 'user123';
      const mockBlog = { save: jest.fn().mockResolvedValue(blogData) };

      Blog.mockImplementation(() => mockBlog);

      const result = await createBlog(userId, blogData, null, null);

      expect(uploadService.uploadFile).not.toHaveBeenCalled();
      expect(mockBlog.save).toHaveBeenCalled();
      expect(result).toEqual(blogData);
    });

    it('should throw an error if creating blog fails', async () => {
      const blogData = { title: 'New Blog' };
      const userId = 'user123';
      const mockError = new Error('Failed to create blog');
      Blog.mockImplementation(() => {
        throw mockError;
      });

      await expect(createBlog(userId, blogData)).rejects.toThrow(mockError);
    });
  });

  describe('getAllBlogs', () => {
    it('should return paginated blogs', async () => {
      const args = { page: 1, pageSize: 2 };
      const mockBlogs = [{ title: 'Blog 1' }, { title: 'Blog 2' }];
      const mockTotalCount = 5;

      Blog.countDocuments.mockResolvedValue(mockTotalCount);
      Blog.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockBlogs),
      });

      const result = await getAllBlogs(args);

      expect(Blog.countDocuments).toHaveBeenCalled();
      expect(Blog.find).toHaveBeenCalled();
      expect(result).toEqual({
        totalPages: Math.ceil(mockTotalCount / args.pageSize),
        blogs: mockBlogs,
      });
    });

    it('should throw an error if fetching blogs fails', async () => {
      const mockError = new Error('Failed to fetch blogs');
      Blog.find.mockImplementation(() => {
        throw mockError;
      });

      await expect(getAllBlogs({})).rejects.toThrow(mockError);
    });
  });

  describe('getBlogById', () => {
    it('should return a blog by ID', async () => {
      const blogId = 'blog123';
      const mockBlog = { _id: blogId, title: 'Test Blog' };
      Blog.findById.mockResolvedValue(mockBlog);

      const result = await getBlogById(blogId);

      expect(Blog.findById).toHaveBeenCalledWith(blogId);
      expect(result).toEqual(mockBlog);
    });

    it('should throw an error if blog is not found', async () => {
      const blogId = 'invalidId';
      Blog.findById.mockResolvedValue(null);

      await expect(getBlogById(blogId)).rejects.toThrow();
    });
  });

  describe('updateBlog', () => {
    it('should update the blog and upload new images', async () => {
      const blogId = 'blog123';
      const blogData = { title: 'Updated Blog' };
      const imageData = { originalname: 'new_image.png' };
      const coverImage = { originalname: 'new_cover.png' };
      const mockBlog = {
        _id: blogId,
        save: jest.fn().mockResolvedValue(blogData),
      };

      Blog.findById.mockResolvedValue(mockBlog);
      uploadService.uploadFile
        .mockResolvedValueOnce('new_image_url')
        .mockResolvedValueOnce('new_cover_image_url');

      const result = await updateBlog(blogId, blogData, imageData, coverImage);

      expect(Blog.findById).toHaveBeenCalledWith(blogId);
      expect(uploadService.uploadFile).toHaveBeenCalledWith(
        imageData,
        `Blogs/${mockBlog.creator}/images/`,
        imageData.originalname
      );
      expect(uploadService.uploadFile).toHaveBeenCalledWith(
        coverImage,
        `Blogs/${mockBlog.creator}/images/`,
        coverImage.originalname
      );
      expect(mockBlog.save).toHaveBeenCalled();
      expect(result).toEqual(blogData);
    });

    it('should throw an error if blog is not found', async () => {
      const blogId = 'invalidId';
      Blog.findById.mockResolvedValue(null);

      await expect(updateBlog(blogId, {})).rejects.toThrow('Blog not found');
    });
  });

  describe('deleteBlog', () => {
    it('should delete a blog by ID', async () => {
      const blogId = 'blog123';
      const mockBlog = { _id: blogId, title: 'Blog to delete' };

      Blog.findByIdAndDelete.mockResolvedValue(mockBlog);

      const result = await deleteBlog(blogId);

      expect(Blog.findByIdAndDelete).toHaveBeenCalledWith(blogId);
      expect(result).toEqual(mockBlog);
    });

    it('should throw an error if deletion fails', async () => {
      const blogId = 'blog123';
      const mockError = new Error('Deletion failed');
      Blog.findByIdAndDelete.mockImplementation(() => {
        throw mockError;
      });

      await expect(deleteBlog(blogId)).rejects.toThrow(mockError);
    });
  });

  describe('getAllBlogsByUser', () => {
    it('should return all blogs for a specific user', async () => {
      const userId = 'user123';
      const mockBlogs = [{ title: 'Blog 1' }, { title: 'Blog 2' }];

      Blog.find.mockResolvedValue(mockBlogs);

      const result = await getAllBlogsByUser(userId);

      expect(Blog.find).toHaveBeenCalledWith({ creator: userId });
      expect(result).toEqual(mockBlogs);
    });

    it('should throw an error if fetching blogs fails', async () => {
      const userId = 'user123';
      const mockError = new Error('Fetch failed');
      Blog.find.mockImplementation(() => {
        throw mockError;
      });

      await expect(getAllBlogsByUser(userId)).rejects.toThrow(mockError);
    });
  });

  describe('getLatestBlogs', () => {
    it('should return the latest blogs with a limit', async () => {
      const limit = 5;
      const mockBlogs = [{ title: 'Latest Blog 1' }, { title: 'Latest Blog 2' }];

      Blog.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockBlogs),
      });

      const result = await getLatestBlogs(limit);

      expect(Blog.find).toHaveBeenCalled();
      expect(Blog.find().sort).toHaveBeenCalledWith({ date: -1 });
      expect(Blog.find().limit).toHaveBeenCalledWith(limit);
      expect(result).toEqual(mockBlogs);
    });

    it('should throw an error if fetching latest blogs fails', async () => {
      const mockError = new Error('Fetch latest blogs failed');
      Blog.find.mockImplementation(() => {
        throw mockError;
      });

      await expect(getLatestBlogs(5)).rejects.toThrow(mockError);
    });
  });
});
