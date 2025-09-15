import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    body: { type: String, default: "" },
  },
  { timestamps: true }
);

// TTL index: emails expire after 24 hours (86400 seconds)
// Change expireAfterSeconds value to adjust retention time
MessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export default mongoose.model("Message", MessageSchema);
