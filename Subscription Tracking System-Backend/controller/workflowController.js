import dayjs from 'dayjs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { serve } = require('@upstash/workflow/express');
import Subscripition from '../models/subscripitionModel.js';
import { sendReminderEmail } from '../utils/send-email.js';

const Remainders=[7,5,2,1];

export const sendRemainders = serve(async (context) => {
    const { subscriptionId } = context.requestPayload;
    
    const subscription = await fetchSubscription(context, subscriptionId);
    
// || subscription.status.toLowerCase() !== 'active'
    if (!subscription  )return;

    const renewalDate = dayjs(subscription.renewalDate);

    if (renewalDate.isBefore(dayjs())) {
        console.log(`Renewal date has passed for subscription ${subscriptionId}. Stopping Workflow`);
        return;
    }
    console.log(dayjs());
    for(const daysBefore of Remainders){
        const reminderDate= renewalDate.subtract(daysBefore,'day');
        

        if(reminderDate.isAfter(dayjs())){
           await sleepUntilReminder(context ,`${daysBefore} days before reminder` , reminderDate);
        }
        if(dayjs().isSame(reminderDate,'day')){
            await triggerReminder(context , `${daysBefore} days before reminder`,subscription);
        }
    }
});

const fetchSubscription = async (context, subscriptionId) => {
    return await context.run('get subscription', async() => {
        return Subscripition.findById(subscriptionId).populate('user', 'name email');
    })
}

const sleepUntilReminder=async(context, label, date)=>{
    console.log(`Sleeping until ${label} reminder at ${date}`);
    await context.sleepUntil(label, date.toDate());
}

const triggerReminder = async(context , label,subscription)=>{
    return await context.run(label, async()=>{
        console.log(`Triggering ${label} reminder.`);

        await sendReminderEmail({
            to:subscription.user.email,
            type:label,
            subscription,
        })
    })
}