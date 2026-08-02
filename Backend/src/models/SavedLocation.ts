import mongoose, { Schema } from "mongoose";

const savedLocationSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    city: {
      type: String,
      required: true
    },
    country: String,
    temperature: Number,
    condition: String,
    latitude: Number,
    longitude: Number
  },
  {
    timestamps: true
  }
);

// Compound index so a user cannot duplicate saved cities
savedLocationSchema.index({ userId: 1, city: 1 }, { unique: true });

export default mongoose.models.SavedLocation || mongoose.model("SavedLocation", savedLocationSchema);
