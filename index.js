import dotenv from "dotenv";
import express from "express";
import multer from "multer";
import { connectionDb } from "./db.js";
import Message from "./messages.js";
dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

function getSafeString(value) {
  return typeof value === "string" ? value : "";
}

function extractEmail(emailString) {
  const cleanString = getSafeString(emailString).trim();
  if (!cleanString) return "";

  const emailMatch =
    cleanString.match(/<([^>]+)>/) ||
    cleanString.match(/([^\s,;<>@]+@[^\s,;<>@]+)/);
  return emailMatch ? emailMatch[1] : cleanString;
}

function removeHtmlTags(html) {
  return getSafeString(html)
    .replace(/<[^>]*>/g, "")
    .trim();
}

app.post("/webhook", upload.any(), async (req, res) => {
  try {
    const emailData = req.body || {};
    if (Object.keys(emailData).length === 0) {
      return res.status(200).json({ status: "empty_body" });
    }

    const senderField =
      getSafeString(emailData.sender) ||
      getSafeString(emailData.from) ||
      getSafeString(emailData.From);
    const fromEmail = extractEmail(senderField);

    const recipientField =
      getSafeString(emailData.recipient) ||
      getSafeString(emailData.to) ||
      getSafeString(emailData.To);
    const toEmail = extractEmail(recipientField);

    const plainText =
      getSafeString(emailData["body-plain"]) ||
      getSafeString(emailData.text) ||
      getSafeString(emailData["stripped-text"]);

    const htmlText =
      getSafeString(emailData["body-html"]) ||
      getSafeString(emailData.html) ||
      getSafeString(emailData["stripped-html"]);

    const emailBody = plainText || removeHtmlTags(htmlText);

    const newMessage = {
      from: fromEmail || senderField,
      to: toEmail || recipientField,
      body: emailBody,
    };

    const savedMessage = await Message.create(newMessage);

    return res.status(200).json({
      status: "success",
      id: savedMessage._id,
    });
  } catch (error) {
    console.error("Error processing email:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

async function startServer() {
  try {
    await connectionDb(MONGODB_URI);
    app.listen(PORT, () => {
      console.log(`Temp Mail Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
