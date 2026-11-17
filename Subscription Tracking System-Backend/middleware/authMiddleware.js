import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

dotenv.config();
const JWT_SECRET= process.env.JWT_SECRET;

export const authorize =async (req,res,next)=>{

    try {
        let token;

        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
            token=req.headers.authorization.split(' ')[1];
        }

        if(!token){
            res.status(401).json({
                sucess:false,
                message:'Unauthorized'
            });
        }

        const decoded =jwt.verify(token, JWT_SECRET);

        const user = await User.findById(decoded.userId);

        if(!user)   res.status(401).json({sucess:false , message:'User not found', error:error.message});
        
        req.user = user;

        next();
    } catch (error) {
        res.status(401).json({sucess:false , message:'Unauthorized', error:error.message});
    }

}