import { workflowClient } from "../config/upstash.js";
import Subscripition from "../models/subscripitionModel.js";
import dotenv from 'dotenv';
dotenv.config();
const SERVER_URL=process.env.SERVER_URL;
export const createSubscription = async (req, res, next) => {
    try {

        const subscriptions = await Subscripition.create({
            ...req.body,
            user: req.user._id,
        })

        const {workflowRunId}=await workflowClient.trigger({
            url:`${SERVER_URL}/api/v1/workflow/subscriptions/reminder`,
            body:{
                subscriptionId:subscriptions._id.toString(),
            },
            headers:{
                'content-type':'application/json'
            },
            retries:0,

        })

        res.status(201).json({ success: true, data:{ subscriptions,workflowRunId} });

    } catch (error) {
        console.log(error);
        next(error);
    }
}
export const getUserSubscription = async (req, res, next) => {
    try {
        if (req.user.id !== req.params.id) {
            const error = new Error('You are not the owner of this account');
            error.status = 401;
            throw error;
        }

        const subscriptions = await Subscripition.find({ user: req.params.id });

        res.status(200).json({ success: true, data: subscriptions });

    } catch (error) {
        next(error);
    }
}

export const getSubscriptionDetails = async (req, res, next) => {
    try {

        const subscriptionDetail = await Subscripition.findById(req.params.id);

        if (!subscriptionDetail) {
            res.status(404).json({
                success: false,
                message: 'Could not found any subscription',

            })
        }

        res.status(200).json({ success: true, data: subscriptionDetail });

    } catch (error) {
        next(error);
    }
}