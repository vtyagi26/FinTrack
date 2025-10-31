import mongoose from "mongoose";

const holdingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  symbol: { type: String, required: true },
  quantity: { type: Number, required: true },
  avgCost: { type: Number, required: true },
  currentPrice: { type: Number, required: true },
});

const Holding = mongoose.model("Holding", holdingSchema);
export default Holding;
