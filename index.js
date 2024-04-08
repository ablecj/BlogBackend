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


dotenv.config();

app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());


app.get('/', (req, res) => {
    res.json({message: 'API Working successfully'});
});

// auth route
app.use('/auth', authRouter);

// blog routes
app.use('/blog', blogRouter)
app.listen(PORT, ()=> {
    console.log(`Server started on PORT: ${PORT}`);
})
