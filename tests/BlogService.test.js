// const request = require('supertest');
// const mongoose = require('mongoose');
// const index = require('../index'); 
// const Blog = require('../models/Blog');

// // Mock upload service for integration tests
// jest.mock('../services/FileService', () => ({
//     uploadFile: jest.fn().mockResolvedValue('mocked-url')
// }));

// describe('Blog API Integration Tests', () => {
//     let mockUserId;
//     let mockBlogData;
//     let mockImageData;
//     let testConnection;

//     beforeAll(async () => {
//         // Connect to the test database
//         testConnection = await mongoose.createConnection('mongodb://localhost:27017/blog_test_db', { useNewUrlParser: true, useUnifiedTopology: true });
//     });

//     beforeEach(async () => {
//         mockUserId = new mongoose.Types.ObjectId();
//         mockBlogData = {
//             title: 'Test Blog',
//             resume: 'Test Resume',
//             details: 'Test Details',
//             content: 'Test Content',
//             tags: ['test'],
//             // date: new Date(),
//             date: '2024-03-15',
//             creator: mockUserId
//         };
//         mockImageData = { originalname: 'test-image.png' };

//         // Reset the database
//         await Blog.deleteMany({});
//     });

//     afterAll(async () => {
//         await testConnection.close();
//     });

//     it('should create a blog', async () => {
//         const response = await request(index)
//             .post('/blogs/createBlog')
//             .field('title', mockBlogData.title)
//             .field('resume', mockBlogData.resume)
//             .field('details', mockBlogData.details)
//             .field('content', mockBlogData.content)
//             .field('tags', mockBlogData.tags)
//             .field('date', mockBlogData.date)
//             .field('creator', mockBlogData.creator)
//             .attach('imageData', Buffer.from('test image data'), {
//                 filename: 'test-image.png'
//             });
    
//         expect(response.status).toBe(201);
//         expect(response.body).toHaveProperty('_id');
//         expect(response.body).toHaveProperty('image', 'mocked-url');
//     });
    

//     it('should get all blogs', async () => {
//         const blog = new Blog(mockBlogData);
//         await blog.save();

//         const response = await request(index).get('/blogs');

//         expect(response.status).toBe(200);
//         expect(response.body.blogs.length).toBe(1);
//         expect(response.body.blogs[0]._id).toBe(blog._id.toString());
//     });

//     it('should get a blog by ID', async () => {
//         const blog = new Blog(mockBlogData);
//         await blog.save();

//         const response = await request(index).get(`/blogs/${blog._id}`);

//         expect(response.status).toBe(200);
//         expect(response.body._id).toBe(blog._id.toString());
//     });

//     it('should update a blog', async () => {
//         const blog = new Blog(mockBlogData);
//         await blog.save();

//         const updatedData = { title: 'Updated Title' };

//         const response = await request(index)
//             .put(`/blogs/update/${blog._id}`)
//             .send(updatedData);

//         expect(response.status).toBe(200);
//         expect(response.body.title).toBe(updatedData.title);
//     });

//     it('should delete a blog', async () => {
//         const blog = new Blog(mockBlogData);
//         await blog.save();

//         const response = await request(index).delete(`/blogs/delete/${blog._id}`);

//         expect(response.status).toBe(204);
//         const deletedBlog = await Blog.findById(blog._id);
//         expect(deletedBlog).toBeNull();
//     });
// });


const Blog = require('../models/Blog');
const uploadService = require('../services/FileService');
const blogController = require('../controllers/BlogController'); 

jest.mock('../models/Blog');
jest.mock('../services/FileService');

describe('Blog Controller', () => {
    let mockBlogData;
    let mockUserId;
    let mockImageData;
    let mockCoverImage;

    beforeAll(() => {
        // Connect to the test database if necessary
    });

    beforeEach(() => {
        mockUserId = 'userId123';
        mockBlogData = {
            title: 'Test Blog',
            resume: 'Test Resume',
            details: 'Test Details',
            content: 'Test Content',
            tags: ['test'],
            date: new Date()
        };
        mockImageData = {
            originalname: 'test-image.png'
        };
        mockCoverImage = {
            originalname: 'test-cover.png'
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        // Disconnect from the test database if necessary
    });

    describe('createBlog', () => {
        it('should create a blog with images', async () => {
            uploadService.uploadFile.mockResolvedValueOnce('image-url').mockResolvedValueOnce('cover-url');
            Blog.prototype.save = jest.fn().mockResolvedValue(mockBlogData);

            const result = await blogController.createBlog(mockUserId, mockBlogData, mockImageData, mockCoverImage);

            expect(uploadService.uploadFile).toHaveBeenCalledWith(mockImageData, `Blogs/${mockUserId}/images/`, mockImageData.originalname);
            expect(uploadService.uploadFile).toHaveBeenCalledWith(mockCoverImage, `Blogs/${mockUserId}/images/`, mockCoverImage.originalname);
            expect(result).toEqual(mockBlogData);
        });

        it('should handle errors', async () => {
            const error = new Error('Test Error');
            Blog.prototype.save = jest.fn().mockRejectedValue(error);

            await expect(blogController.createBlog(mockUserId, mockBlogData, mockImageData, mockCoverImage)).rejects.toThrow('Test Error');
        });

        it('should create a blog without images', async () => {
            Blog.prototype.save = jest.fn().mockResolvedValue(mockBlogData);

            const result = await blogController.createBlog(mockUserId, mockBlogData);

            expect(uploadService.uploadFile).not.toHaveBeenCalled();
            expect(result).toEqual(mockBlogData);
        });

        it('should handle missing userId', async () => {
            await expect(blogController.createBlog(null, mockBlogData, mockImageData, mockCoverImage)).rejects.toThrow();
        });
    });

    describe('getAllBlogs', () => {
        it('should return paginated blogs', async () => {
            const mockBlogs = [mockBlogData];
            Blog.countDocuments.mockResolvedValue(1);
            Blog.find.mockImplementation(() => ({
                sort: jest.fn().mockImplementation(() => ({
                    skip: jest.fn().mockImplementation(() => ({
                        limit: jest.fn().mockResolvedValue(mockBlogs)
                    }))
                }))
            }));

            const args = { page: 1, pageSize: 10 };
            const result = await blogController.getAllBlogs(args);

            expect(result).toEqual({ totalPages: 1, blogs: mockBlogs });
        });

        it('should handle errors', async () => {
            const error = new Error('Test Error');
            Blog.countDocuments.mockRejectedValue(error);

            await expect(blogController.getAllBlogs({})).rejects.toThrow('Test Error');
        });

        it('should handle large datasets', async () => {
            const mockBlogs = new Array(100).fill(mockBlogData);
            Blog.countDocuments.mockResolvedValue(100);
            Blog.find.mockImplementation(() => ({
                sort: jest.fn().mockImplementation(() => ({
                    skip: jest.fn().mockImplementation(() => ({
                        limit: jest.fn().mockResolvedValue(mockBlogs)
                    }))
                }))
            }));

            const args = { page: 1, pageSize: 100 };
            const result = await blogController.getAllBlogs(args);

            expect(result.blogs.length).toBe(100);
            expect(result.totalPages).toBe(1);
        });
    });

    describe('getAllBlogsByUser', () => {
        it('should return blogs for a specific user', async () => {
            const mockBlogs = [mockBlogData];
            Blog.find.mockResolvedValue(mockBlogs);

            const result = await blogController.getAllBlogsByUser(mockUserId);

            expect(result).toEqual(mockBlogs);
        });

        it('should handle errors', async () => {
            const error = new Error('Test Error');
            Blog.find.mockRejectedValue(error);

            await expect(blogController.getAllBlogsByUser(mockUserId)).rejects.toThrow('Error fetching blogs for user userId123: Test Error');
        });

        it('should handle non-existent user', async () => {
            Blog.find.mockResolvedValue([]);

            const result = await blogController.getAllBlogsByUser('nonExistentUserId');

            expect(result).toEqual([]);
        });
    });

    describe('getBlogById', () => {
        it('should return a blog by ID', async () => {
            Blog.findById.mockResolvedValue(mockBlogData);

            const result = await blogController.getBlogById('blogId123');

            expect(result).toEqual(mockBlogData);
        });

        it('should handle errors', async () => {
            const error = new Error('Test Error');
            Blog.findById.mockRejectedValue(error);

            await expect(blogController.getBlogById('blogId123')).rejects.toThrow('Test Error');
        });

        it('should handle non-existent blog ID', async () => {
            Blog.findById.mockResolvedValue(null);

            const result = await blogController.getBlogById('nonExistentBlogId');

            expect(result).toBeNull();
        });
    });

    describe('updateBlog', () => {
        it('should update a blog with new data and images', async () => {
            Blog.findById.mockResolvedValue(mockBlogData);
            uploadService.uploadFile.mockResolvedValueOnce('new-image-url').mockResolvedValueOnce('new-cover-url');
            Blog.prototype.save = jest.fn().mockResolvedValue(mockBlogData);

            const result = await blogController.updateBlog('blogId123', mockBlogData, mockImageData, mockCoverImage);

            expect(uploadService.uploadFile).toHaveBeenCalledWith(mockImageData, `Blogs/${mockUserId}/images/`, mockImageData.originalname);
            expect(uploadService.uploadFile).toHaveBeenCalledWith(mockCoverImage, `Blogs/${mockUserId}/images/`, mockCoverImage.originalname);
            expect(result).toEqual(mockBlogData);
        });

        it('should handle errors', async () => {
            const error = new Error('Test Error');
            Blog.findById.mockRejectedValue(error);

            await expect(blogController.updateBlog('blogId123', mockBlogData, mockImageData, mockCoverImage)).rejects.toThrow('Test Error');
        });

        it('should handle non-existent blog ID', async () => {
            Blog.findById.mockResolvedValue(null);

            await expect(blogController.updateBlog('nonExistentBlogId', mockBlogData, mockImageData, mockCoverImage)).rejects.toThrow('Blog not found');
        });
    });

    describe('deleteBlog', () => {
        it('should delete a blog by ID', async () => {
            Blog.findByIdAndDelete.mockResolvedValue(mockBlogData);

            const result = await blogController.deleteBlog('blogId123');

            expect(result).toEqual(mockBlogData);
        });

        it('should handle errors', async () => {
            const error = new Error('Test Error');
            Blog.findByIdAndDelete.mockRejectedValue(error);

            await expect(blogController.deleteBlog('blogId123')).rejects.toThrow('Test Error');
        });

        it('should handle non-existent blog ID', async () => {
            Blog.findByIdAndDelete.mockResolvedValue(null);

            const result = await blogController.deleteBlog('nonExistentBlogId');

            expect(result).toBeNull();
        });
    });

    describe('getLatestBlogs', () => {
        it('should return the latest blogs', async () => {
            const mockBlogs = [mockBlogData];
            Blog.find.mockImplementation(() => ({
                sort: jest.fn().mockImplementation(() => ({
                    limit: jest.fn().mockResolvedValue(mockBlogs)
                }))
            }));

            const result = await blogController.getLatestBlogs(10);

            expect(result).toEqual(mockBlogs);
        });

        it('should handle errors', async () => {
            const error = new Error('Test Error');
            Blog.find.mockRejectedValue(error);

            await expect(blogController.getLatestBlogs(10)).rejects.toThrow('Error fetching latest blogs: Test Error');
        });

        it('should handle limit zero', async () => {
            const result = await blogController.getLatestBlogs(0);

            expect(result).toEqual([]);
        });
    });
});
