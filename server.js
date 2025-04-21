import express from "express";
import dotenv from "dotenv";
import { validateBase64Image, uploadBase64ToS3 } from "./src/s3-service.js";
import { analyzeImageText } from "./src/rekognition-service.js";

dotenv.config();
const app = express();
const port = 5000;

app.use(express.json({ limit: "200mb" }));

app.post("/extract-text", async (req, res) => {
  const { base64Image } = req.body;

  if (!base64Image) {
    return res.status(400).json({ error: "No image provided" });
  }

  // Validate Image Format
  const validation = validateBase64Image(base64Image);
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    // Upload Image to S3
    const { fileName, signedUrl } = await uploadBase64ToS3(validation.base64Data, validation.format);

    // Analyze Image with AWS Rekognition
    const extractedText = await analyzeImageText(fileName);

    res.json({ text: extractedText, imageUrl: signedUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
