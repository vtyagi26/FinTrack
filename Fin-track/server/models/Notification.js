// models/Notification.js
const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ["alert", "error", "info"], default: "alert" },
  isRead: { type: Boolean, default: false },
  // For idempotency: symbol + type + date_string
  alertHash: { type: String, unique: true } 
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);