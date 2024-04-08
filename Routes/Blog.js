import express from 'express';
const router = express.Router();
import User from '../Models/userSchema.js';
import Blog from '../Models/blogSchema.js';
import authTokenHandler from '../Middlewares/authTokenMiddleware.js';
import jwt from 'jsonwebtoken';



// checking the ownership of the post
const checkBlogOwnership = async(req,res,next)=>{
    try {
        const blog = await Blog.findById(req.params.id);
        if(!blog){
            return res.status(404).json({message: 'Blog post not fount!'})
        }
        if(blog.owner.toString()!== req.userId){
            return res.status(403).json({ message: "Permision denied: you are not own this blog"});
        }
        req.blog = blog;
        next();
    } catch (err) {
        res.status(500).json({message: err.message});
    }
}


router.get('/test', authTokenHandler, async(req,res)=> {
    res.json({
        message: "Test api is working for the blog route"
    })
})

// creating a new blog
router.post('/', authTokenHandler, async(req,res)=>{
    try {
        const {title, description, image, paragraph} = req.body;
        const blog = new Blog({title,description, image, paragraph, owner: req.userId});
        await blog.save();
        // finding the id from the user collection
        const user = await User.findById(req.userId);
        if(!user){
            return res.status(404).json({message: 'User Not Found'});
        }
        user.blogs.push(blog._id);
        await user.save();

        res.status(200).json({message: 'Blog post created successfully', blog});
    } catch (err) {
        res.status(500).json({message: err.message });
    }
})

// route for get the blog
router.get('/:id', authTokenHandler, async(req, res)=> {
    try {
        const blog = await Blog.findById(req.params.id);
        if(!blog){
            return res.status(404).json({message: "Blog post not found"})
        }
        res.status(200).json(blog);
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
})
// route for updating the post 
router.put('/:id', authTokenHandler, checkBlogOwnership, async(req,res)=>{
    try {
        const {title, description, image, paragraph} = req.body;
        const updateBlog = await Blog.findByIdAndUpdate(
          req.params.id,
          {title, description, image, paragraph},
          {new: true}  
        );

        if(!updateBlog){
            return res.status(404).json({message: "Blog post not found!"});
        }

        res.status(200).json({message: 'Blog Post updated successfully!',updateBlog});
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});

// route for delete the blog
router.delete('/:id', authTokenHandler, checkBlogOwnership, async(req,res)=>{
    try {
        const deletinBlog = await Blog.findByIdAndDelete(req.params.id);
        if(!deletinBlog){
            return res.status(404).json({message: "Blog post not found"});
        }
        // deleting the blogs from the user schema
        const user = await User.findById(req.userId);
        if(!user){
            return res.status(404).json({message: 'User not found'});
        }
        // deleting is not working need to check
        user.blogs.pull(req.params.id);
        await user.save();
        res.status(200).json({message: "Blog deleted sucessfully", deletinBlog});

    } catch (err) {
        res.status(500).json({message: err.message});
    }
});

// routes for searching the blog
router.get('/', async (req, res) => {
    try {
        // searching the blogs
        const search = req.body.search || ''; // Use req.query instead of req.body for GET requests
        // selecting the pages 
        const page = parseInt(req.body.page) || 1; // Use req.query instead of req.body for GET requests
        // no. of blogs per page
        const perPage = 2;

        // for searching and finding the blogs with minimal content
        const searchQuery = new RegExp(search, 'i'); // Use 'i' for case-insensitive search
        // finds the total number of blogs in the same search result
        const totalBlogs = await Blog.countDocuments({ title: searchQuery });
        // from the above we find the total number of blogs now we find how many pages it required to show 
        const totalPages = Math.ceil(totalBlogs / perPage);

        if (page < 1 || page > totalPages) {
            return res.status(404).json({ message: 'Invalid page number' }); // Return here to stop further execution
        }

        // skip method to skip the pages 
        const skip = (page - 1) * perPage;
        const blogs = await Blog.find({ title: searchQuery })
            .sort({ createdAt: -1 }).skip(skip).limit(perPage);

        return res.status(200).json({ blogs, totalPages, currentPage: page });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});



export default router;