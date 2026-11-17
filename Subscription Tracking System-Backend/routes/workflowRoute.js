import { Router } from "express";
import { sendRemainders } from "../controller/workflowController.js";

const workflowRouter=Router();

workflowRouter.post('/subscriptions/reminder',sendRemainders);

export default workflowRouter;