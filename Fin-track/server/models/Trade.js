import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  symbol: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  type: { type: String, enum: ["buy", "sell"], required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Trade", tradeSchema);
