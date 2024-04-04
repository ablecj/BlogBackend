import express from 'express';
const router = express.Router();
import User from '../Models/userSchema.js';


router.get('/test', (req,res)=> {
    res.json({
        message: 'User API Working successfully !'
    })
});

router.post('/register', async(req,res)=> {
    try {
        const {name, email, password} = req.body;
        // tryto find there is already existing user
        const exisiting = await User.findOne({email: email});
        if(exisiting){
            res.status(409).json({message: 'User already exists'});
        }
        // saving the new user to the database
        const newUser = new User({name, email, password});

        new newUser.save();
        res.status(201).jsom({message: 'User registered successfuly !'});

    } catch (error) {
        res.status(500).json({message: error.message});
    }
})





export default router;