import nodemailer from 'nodemailer';
import dotenv from 'dotenv'
dotenv.config();
const password=process.env.EMAIL_PASSWORD;

export const accountEmail='anub786hav@gmail.com'
const transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:accountEmail,
        pass:password
    }
})
export default transporter;