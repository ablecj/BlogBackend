import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
    },
    blogs: {
        type: Array,
        default: [],
    }
});


userSchema.pre('save', async(req,res)=>{
    const user = this;

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    }
});

export default mongoose.model('User', userSchema);