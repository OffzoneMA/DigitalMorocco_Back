const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    resume: {
        type: String,
        require: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    details: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    tags: [
        {
            type: String
        }
    ],
    date: {
        type: Date,
        default: Date.now
    },
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
