import mongoose from 'mongoose';

const CreatorSchema = new mongoose.Schema({
    private_key: { type: String, default: "" },
    public_key: { type: String, default: "" },
  });

const Creator = mongoose.model('Creator', CreatorSchema);

export default Creator;
