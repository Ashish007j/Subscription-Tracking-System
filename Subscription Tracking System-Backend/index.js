import express from 'express';
import dotenv from 'dotenv';
import authRoute from './routes/authRoute.js';
import userRouter from './routes/userRouter.js';
import subscriptionRouter from './routes/subscriptionRouter.js';
import connectToDatabase from './database/mognoDB.js';
import errorMiddleware from './middleware/errorMiiddleware.js';
import cookieParser from 'cookie-parser';
import arcjetMiddleware from './middleware/arcjetMiddleware.js';
import workflowRouter from './routes/workflowRoute.js';
const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(express.urlencoded({extended:false}))
app.use(cookieParser());
app.use(arcjetMiddleware)

app.use(express.json());

app.use('/api/v1/auth', authRoute);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/workflow', workflowRouter);

app.use(errorMiddleware);

app.get('/', (req, res) => {
    res.send('Welcome to backend setup');
})

const connection = async () => {
    await connectToDatabase();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
}
connection();

export default app;