import cloudinary from "../config/cloudinary.js";
import Image from "../models/Image.js";
import User from "../models/User.js";
import razorpayInstance from "../config/razorpay.js";

export const uploadImage = async (req, res) => {
  const { paymentId } = req.params;
  const { amount, image } = req.body;
  const { userId } = req.body;

  try {
    console.log(
      "Received image data:",
      image ? `${image.slice(0, 100)}...` : "No image data"
    );

    let payment;
    try {
      // Attempt to capture the payment
      payment = await razorpayInstance.payments.capture(
        paymentId,
        amount * 100,
        "INR"
      );
    } catch (captureError) {
      // If the payment has already been captured, fetch the payment details
      if (
        captureError.error &&
        captureError.error.description ===
          "This payment has already been captured"
      ) {
        payment = await razorpayInstance.payments.fetch(paymentId);
      } else {
        throw captureError;
      }
    }

    if (payment.status !== "captured") {
      return res.status(500).json({ error: "Payment not captured" });
    }

    console.log("Payment captured successfully:", payment);

    if (!image) {
      return res.status(400).json({ error: "No image data received" });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const uploadResponse = await cloudinary.v2.uploader.upload(
      `data:image/png;base64,${base64Data}`,
      {
        folder: "custom_shirts",
      }
    );

    const newImage = new Image({ url: uploadResponse.secure_url });
    const savedImage = await newImage.save();

    // Check if the user exists
    let user = await User.findById(userId);
    if (!user) {
      // If the user doesn't exist, create a new user
      user = new User({ _id: userId, images: [savedImage._id] });
      
    } else {
      // If the user exists, push the new image ID to their images array
      user.images.push(savedImage._id);
    }

    // Save the user document (new or updated)
    await user.save();

    res.json({
      message: "Payment successful and image uploaded",
      imageUrl: uploadResponse.secure_url,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message || "Error in payment capture process" });
  }
};

export const getUserImages = async (req, res) => {
  try {
    // Fetch the userId from the query parameters
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "UserId is required" });
    }

    // Fetch the user by their userId (which is a string)
    const user = await User.findById(userId).populate("images");
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return the user's images
    res.json(user.images);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user images" });
  }
};
