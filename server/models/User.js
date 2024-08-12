import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Use custom userId as the _id
  username: { type: String },
  password: { type: String },
  images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Image' }],
});

const User = mongoose.model('User', UserSchema);

export default User;
