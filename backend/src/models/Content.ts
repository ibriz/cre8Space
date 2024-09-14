import mongoose from 'mongoose';

const ContentSchema = new mongoose.Schema({
    blob_id: { type: String, required: true },
    file_type: { type: String, required: true },
    encrypted_obj: { type: String, required: false},
    description: { type: String, required: true },
    owner: { type: String, required: true },
    title: { type: String, required: true },
    tag: { type: String, required: true },
    content: {type: String, required: true},
    incentivized_amount: {type: Number, required: true}
  }, { timestamps: true });

const Content = mongoose.model('Content', ContentSchema);

export default Content;
