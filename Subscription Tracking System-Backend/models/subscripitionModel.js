import mongoose from "mongoose";

const subscriptionSchema = mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Name of subscription is required'],
        trim: true,

    },

    price: {
        type: Number,
        required: [true, 'Subscripition price is required']
    },

    currency: {
        type: String,
        enum: ['INR', 'USD'],
        default: 'INR'
    },

    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
    },

    category: {
        type: String,
        enum: ['sports', 'entertainment', 'lifestyle', 'technology', 'finance', 'polictics', 'others'],
        required: true,
    },

    PaymentMethod: {
        type: String,
        required: true,
        trim: true,
    },

    status: {
        type: String,
        enum: ['Active', 'Cancelled', 'Expired'],
        default: 'Active'
    },
    startDate: {
        type: Date,
        required: true,
        validate: {
            validator: (value) => value <= new Date(),
            message: 'Start date must be in the past',
        }
    },

    renewalDate: {
        type: Date,

        validate: {
            validator: function (value) {
                return value > this.startDate;
            },
            message: 'Renewal date mych be after start date'
        },
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    }


}, { timestamps: true })


subscriptionSchema.pre('save', async function () {
    if (!this.renewalDate) {
        const renewalPreriod = {
            daily: 1,
            weekly: 7,
            monthly: 30,
            yearly: 365,
        };

        this.renewalDate = new Date(this.startDate);
        this.renewalDate.setDate(this.renewalDate.getDate() + renewalPreriod[this.frequency]);
    }

    if (this.renewalDate < new Date()) {
        this.status = 'Expired'
    }else{
        this.status='Active'
    }


})

const Subscripition = mongoose.model('Subscription',subscriptionSchema);

export default Subscripition;