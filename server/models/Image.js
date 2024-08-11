import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema({
    url: String,
});

const Image = mongoose.model('Image', ImageSchema);

export default Image;
