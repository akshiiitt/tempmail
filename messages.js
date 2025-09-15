import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    body: { type: String, default: "" },
    receivedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

MessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

export default mongoose.model("Message", MessageSchema);
