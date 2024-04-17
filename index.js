import express from 'express';
const app = express();
import bodyParser from 'body-parser';
import cors from 'cors';

const PORT = 8000;
import dotenv from 'dotenv';
import './db.js';
import cookieParser from 'cookie-parser';

// import User from './Models/userSchema.js';
import authRouter from './Routes/Auth.js';
import blogRouter from './Routes/Blog.js';
import imageUploadeRoute from './Routes/imageUploadRoute.js';


dotenv.config();

// allowed origins
const allowedOrigins = ['http://localhost:3000'];

app.use(bodyParser.json());
app.use(cors({
    origin: function(origin, callback){
        if(!origin || allowedOrigins.includes(origin)){
            callback(null, true);
        }else{
            callback(new Error('Not allowed cors'))
        }
    },
    credentials: true
}));
app.use(cookieParser());


app.get('/', (req, res) => {
    res.json({message: 'API Working successfully'});
});

// auth route
app.use('/auth', authRouter);

// blog routes
app.use('/blog', blogRouter);

// for image uploading route
app.use('/image', imageUploadeRoute);

// for selecting the category 
app.get('/blogcategories', async (req, res) => {
    const blogCategories = [
        "Technology Trends",
        "Health and Wellness",
        "Travel Destinations",
        "Food and Cooking",
        "Personal Finance",
        "Career Development",
        "Parenting Tips",
        "Self-Improvement",
        "Home Decor and DIY",
        "Book Reviews",
        "Environmental Sustainability",
        "Fitness and Exercise",
        "Movie and TV Show Reviews",
        "Entrepreneurship",
        "Mental Health",
        "Fashion and Style",
        "Hobby and Crafts",
        "Pet Care",
        "Education and Learning",
        "Sports and Recreation"
    ];
    res.json(
        {
            message: 'Categories fetched successfully',
            categories: blogCategories
        }
    )
});


app.listen(PORT, ()=> {
    console.log(`Server started on PORT: ${PORT}`);
});
