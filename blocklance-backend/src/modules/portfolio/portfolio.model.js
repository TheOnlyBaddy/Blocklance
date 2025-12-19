import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema({
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String },
  projectLink: { type: String },
  imageUrl: { type: String }, // stored via Cloudinary
  createdAt: { type: Date, default: Date.now },
});

const Portfolio = mongoose.model("Portfolio", portfolioSchema);
export default Portfolio;
