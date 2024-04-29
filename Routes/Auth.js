import express from 'express';
const router = express.Router();
import User from '../Models/userSchema.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import errorHandler from '../Middlewares/errorMiddleware.js';
import dotenv from 'dotenv';
import authTokenHandler from '../Middlewares/authTokenMiddleware.js';
import session from 'express-session';

dotenv.config();

// for nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'gracyebin7@gmail.com',
        pass: 'lqvu pwny wbjq xnya'
    },
    tls: {
        rejectUnauthorized: false // Disables certificate verification
    }
})


// test route for the auth 
router.get('/test', (req,res)=> {
    res.json({
        message: 'User API Working successfully !'
    })
});

// create a response model
function createResponse(ok, message, data) {
    return {
      ok,
      message,
      data,
    };
  }

// send otp api logic
router.post('/sendotp', (req,res, next)=>{
    const {email} = req.body;
    // console.log(email, 'email')
    const otp = Math.floor(100000 + Math.random()* 900000);
    // console.log(otp,"otp")
    try{
        const mailOptions = {
            from: process.env.COMPANY_EMAIL,
            to: email,
            subject: 'OTP for verification',
            text: `your otp for verificstion is ${otp}`
         }   
        //  console.log(mailOptions,"mailOptions");
         
         transporter.sendMail(mailOptions, async(err, info)=>{
            if (err) {
                console.log(err);
                res.status(500).json(createResponse(false, err.message));
            } else {
                res.json(createResponse(true, 'OTP sent successfully', { otp }));
            }
         })
    }
    catch (err) {
        console.log(err);
        res.status(500).json(createResponse(false, err.message));
    }
})


// register logic
router.post('/register', async(req,res, next)=> {
    try {
        const {name, email, password} = req.body;
        // tryto find there is already existing user
        const exisiting = await User.findOne({email: email});
        if(exisiting){
            return res.status(409).json(createResponse(false, 'Email already exists'));
        }
        // saving the new user to the database
        const newUser = new User({name, email, password});

        await newUser.save();
        res.status(201).json(createResponse(true, 'User registered successfully'));

    } catch (err) {
        next(err)
    }
});

// login route 
router.post('/login', async (req, res, next) => {
    try {
        const {email, password} = req.body;
        console.log(password, "pass")
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json(createResponse(false, 'Invalid credentials'));
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json(createResponse(false, 'Invalid credentials'));
        }
        // auth token setting 
        const authToken = jwt.sign({userId: user._id}, process.env.JWT_SECRET_KEY, {expiresIn: '10m'});
        const refreshToken = jwt.sign({userId: user._id}, process.env.JWT_REFRESH_SECRET_KEY, {expiresIn: '50m'});

        res.cookie('authToken', authToken, {httpOnly: true});
        res.cookie('refreshToken', refreshToken, {httpOnly: true});
        res.status(200).json(createResponse(true, 'Login successful', {
            authToken,
            refreshToken
        }));

     } catch (err) {
        next(err);
    }
})

// Configure session middleware
const secretKey = process.env.SESSION_KEY; // Replace with your secret key

router.use(
  session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // Set secure to true if using HTTPS
      httpOnly: true, // Set httpOnly to true for enhanced security
      sameSite: "strict", // Set sameSite to 'strict' or 'lax' for enhanced security
    },
  })
);

// Logout route
router.post('/logout', async (req, res) => {
  // Check if user is authenticated (handled by authTokenHandler middleware) 

  // Clear session cookie
  res.clearCookie('authToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/' });

  // Destroy the session
  if (req.session) {
    console.log(req.session, "session from backend");
    await new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
          return reject(err);
        }
        // console.log(req.session, "session from backend after destroying");
        resolve();
      });
    });

    console.log(res, "response from backend logout")
    // Session destroyed successfully
    return res.status(200).json({ message: 'Logout successful' });
    
  } else {
    // No session found, user is already logged out
    return res.status(400).json({ message: 'User is already logged out' });
  }
});

router.use(errorHandler);

router.get('/checklogin', authTokenHandler, async(req,res)=>{
    res.json({
        ok: true,
        message: 'User authenticated sucessfully !'
    })
})

export default router;