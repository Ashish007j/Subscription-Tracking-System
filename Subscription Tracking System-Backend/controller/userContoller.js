
import User from "../models/userModel.js";

export const getAllUser = async (req, res, next) => {


    try {
        const users = await User.find();

        res.status(200).json({ sucess: true, data: users });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Server could not fetch emails',
            error: error.message

        })
    }
}

export const getUser= async (req,res,next)=>{
    try {
        const user = await User.findById(req.params.id).select('-password');

        if(!user){
            const error = new Error('User not found');
            error.statusCode=404;
            throw error;
        }

        res.status(200).json({sucess:true, data:user})
        
    } catch (error) {
        next(error);
    }
}