import express from 'express';
const router = express.Router();
import User from '../Models/userSchema.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import errorHandler from '../Middlewares/errorMiddleware.js';
import dotenv from 'dotenv';

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
            if(err){
                // console.log(err, "error");
                res.status(500).json({
                    message: err.message
                });
            }
            else{

                console.log(otp, "otp");
                res.json({
                    message: "OTP send successfully", otp: otp
                }); 
            }
         })
    }
    catch(err){
        next(err);
    }
})


// register logic
router.post('/register', async(req,res, next)=> {
    try {
        const {name, email, password} = req.body;
        // tryto find there is already existing user
        const exisiting = await User.findOne({email: email});
        if(exisiting){
            res.status(409).json({message: 'User already exists'});
        }
        // saving the new user to the database
        const newUser = new User({name, email, password});

        await newUser.save();
        res.status(201).json({message: 'User registered successfuly !'});

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
            res.status(400).json({
                message: 'invalid email or password'
            })
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            res.status(400).json({
                message: 'invalid credentials'
            })
        }
        // auth token setting 
        const authToken = jwt.sign({userId: user._id}, process.env.JWT_SECRET_KEY, {expiresIn: '10m'});
        const refreshToken = jwt.sign({userId: user._id}, process.env.JWT_REFRESH_SECRET_KEY, {expiresIn: '1d'});

        res.cookie('authToken', authToken, {httpOnly: true});
        res.cookie('refreshToken', refreshToken, {httpOnly: true});
        res.status(200).json({message: 'Login Successfully'});

     } catch (err) {
        next(err);
    }
})




router.use(errorHandler)

export default router;