import mongoose from 'mongoose';

const UserSettingsSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    annualBudget: { type: Number, default: 25000 },
    currencyCode: { type: String, default: 'USD' },
    theme: { type: String, default: 'light' },
  },
  { timestamps: true }
);

export default mongoose.models.UserSettings || mongoose.model('UserSettings', UserSettingsSchema);
