import mongoose from "mongoose";

async function connectionDb(uri) {
  await mongoose.connect(uri);
  console.log("MongoDB connected");
}

export { connectionDb };
