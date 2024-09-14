import mongoose from 'mongoose';

const IncentivizationSchema = new mongoose.Schema({
  owner: { type: String, required: true, unique: true },
  incentivizedPoints: { type: Number, required: true, default: 0 },
});

export const Incentivization = mongoose.model('Incentivization', IncentivizationSchema);
