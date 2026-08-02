import mongoose, { Schema } from "mongoose";

const weatherSearchSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false
    },
    city: {
      type: String,
      required: true
    },
    country: String,
    temperature: Number,
    feelsLike: Number,
    humidity: Number,
    windSpeed: Number,
    visibility: Number,
    cloudCover: Number,
    condition: String,
    description: String,
    icon: String,
    latitude: Number,
    longitude: Number
  },
  {
    timestamps: true
  }
);

export default mongoose.models.WeatherSearch || mongoose.model("WeatherSearch", weatherSearchSchema);
