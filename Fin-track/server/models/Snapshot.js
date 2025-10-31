import mongoose from "mongoose"; // ✅ added

const SnapshotSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    timestamp: { type: Date, default: Date.now },
    portfolioValue: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Snapshot", SnapshotSchema);
