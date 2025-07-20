// paymentRoutes.js

const express = require('express');
const Razorpay = require('razorpay');
const router = express.Router();

// Initialize Razorpay with test keys
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

router.post('/create-order', async (req, res) => {
    const { amount } = req.body;

    const options = {
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        receipt: `rcptid_${Date.now()}`
    };

    try {
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (err) {
        console.error('Error creating Razorpay order:', err);
        res.status(500).send('Order creation failed');
    }
});

module.exports = router;
