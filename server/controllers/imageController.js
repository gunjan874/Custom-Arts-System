import cloudinary from '../config/cloudinary.js';
import Image from '../models/Image.js';
import User from '../models/User.js';
import razorpayInstance from '../config/razorpay.js';



export const uploadImage = async (req, res) => {
    const { paymentId } = req.params;
    const { amount, image } = req.body;

    try {
        console.log('Received image data:', image ? `${image.slice(0, 100)}...` : 'No image data');

        // Attempt to capture the payment
        let payment;
        try {
            payment = await razorpayInstance.payments.capture(paymentId, amount * 100, 'INR');
        } catch (captureError) {
            if (captureError.error && captureError.error.description === 'This payment has already been captured') {
                payment = await razorpayInstance.payments.fetch(paymentId);
            } else {
                throw captureError;
            }
        }

        if (payment.status !== 'captured') {
            return res.status(500).json({ error: 'Payment not captured' });
        }

        console.log('Payment captured successfully:', payment);

        if (!image) {
            return res.status(400).json({ error: 'No image data received' });
        }

        // Upload image to Cloudinary
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const uploadResponse = await cloudinary.v2.uploader.upload(`data:image/png;base64,${base64Data}`, {
            folder: 'custom_shirts',
        });

        console.log('Image uploaded to Cloudinary:', uploadResponse.secure_url);

        // Save the image URL to MongoDB and associate it with the user
        const userId = req.auth.user.id; // Assuming you're using Clerk's middleware for authentication
        const newImage = new Image({ url: uploadResponse.secure_url });
        const savedImage = await newImage.save();

        // Associate the saved image with the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.images.push(savedImage._id);
        await user.save();

        res.json({ message: 'Payment successful and image uploaded', imageUrl: uploadResponse.secure_url });
    } catch (error) {
        console.error('Error in payment capture process:', error);
        res.status(500).json({ error: error.message || 'Error in payment capture process' });
    }
};


export const getUserImages = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).populate('images');
        res.json(user.images);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user images' });
    }
};
