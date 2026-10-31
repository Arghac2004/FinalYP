import mongoose from 'mongoose';

const AccountSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, default: 'Current Account' },
    currency: { type: String, default: 'USD' },
    initialBalance: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

AccountSchema.index({ userId: 1, id: 1 }, { unique: true });

export default mongoose.models.Account || mongoose.model('Account', AccountSchema);
