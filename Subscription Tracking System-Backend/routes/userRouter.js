import {Router} from 'express';
import { getAllUser, getUser } from '../controller/userContoller.js';
import { authorize } from '../middleware/authMiddleware.js';

const userRouter = Router();

userRouter.get('/',getAllUser);

userRouter.get('/:id', authorize ,getUser);

// userRouter.post('/',(req,res)=>{
//     res.send({
//         title:'Post/Create a User'
//     })
// });

// userRouter.put('/:id',(req,res)=>{
//     res.send({
//         title:'Update the user'
//     })
// });

// userRouter.delete('/:id',(req,res)=>{
//     res.send({
//         title:'Delete the user'
//     })
// });

export default userRouter;