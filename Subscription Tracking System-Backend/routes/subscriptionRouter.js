import { Router } from "express";
import { authorize } from "../middleware/authMiddleware.js";
import { createSubscription, getSubscriptionDetails, getUserSubscription } from "../controller/subscriptionController.js";


const subscriptionRouter=Router();

subscriptionRouter.get('/',(req,res)=>{
    res.send({title:'Get all the subscription'})
})

subscriptionRouter.get('/:id',authorize,getSubscriptionDetails);

subscriptionRouter.post('/',authorize,createSubscription);

subscriptionRouter.put('/:id',(req,res)=>{
    res.send({title:'update subscription'})
})

subscriptionRouter.delete('/:id',(req,res)=>{
    res.send({title:'Delete all the subscription'})
})

subscriptionRouter.get('/user/:id',authorize,getUserSubscription);

subscriptionRouter.put('/:id/cancel',(req,res)=>{
    res.send({title:'Cancel subscription'})
})

subscriptionRouter.get('/upcomming-renewals',(req,res)=>{
    res.send({title:'Get upcomming renewals'})
})

export default subscriptionRouter;