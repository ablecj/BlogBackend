import express from 'express';
const router = express.Router();
import dontenv from 'dotenv';
dontenv.config();
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import multer from 'multer';


// coludinary cond=fig
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// for storage using multer
const storage = multer.memoryStorage();
const upload = multer({storage});

router.post('/uploadimage', upload.single('myimage'), async(req,res)=>{
    const file = req.file;
    if(!file){
        return res.status(400).json({ok: false, error: 'Image file is not provided'})
    }

    sharp(file.buffer)
    .resize({width: 800}).toBuffer(async(err, data,info)=>{
        if(err){
            console.error('Image processing erorr:', err)
            return res.status(500).json({ok:false, error: 'error procesing image'})
        }

        cloudinary.uploader.upload_stream({resource_type: "auto"}, async(error, result)=>{
            if(error){
                console.error('Cloudinary Upload error: ', error);
                return res.status(500).json({ok:false, error: 'error uploading image to the cloudinary!'});
            }
            res.status(200).json({ok:true, imageUrl: result.url, message: 'image uploaded successfully.'});
        }).end(data)
    })
});


export default router;
