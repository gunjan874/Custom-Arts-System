import razorpayInstance from '../config/razorpay.js';

export const createOrder = async (req, res) => {
    const { amount } = req.body;
    const receiptId = `receipt_order_${Date.now()}`;
    const options = {
        amount: amount * 100,
        currency: 'INR',
        receipt: receiptId,
    };

    try {
        const order = await razorpayInstance.orders.create(options);
        res.json(order);
    } catch (error) {
        res.status(500).send('Error creating order');
    }
};
