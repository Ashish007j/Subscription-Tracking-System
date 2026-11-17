import {Router} from 'express';
import { signIn, signOut, signUp } from '../controller/authController.js';

const authRoute = Router();

authRoute.post('/sign_in',signIn);

authRoute.post('/sign_up', signUp);

authRoute.post('/sign_out', signOut);

export default authRoute;