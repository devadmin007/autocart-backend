import { DetectTextCommand } from "@aws-sdk/client-rekognition";
import { rekognitionClient } from "./aws-config.js";

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

// Analyze Image with AWS Rekognition
export const analyzeImageText = async (fileName) => {
  const params = {
    Image: { S3Object: { Bucket: BUCKET_NAME, Name: fileName } },
  };

  const command = new DetectTextCommand(params);
  const data = await rekognitionClient.send(command);

  // Extract text and remove duplicates
  let extractedText = data.TextDetections
    .filter(item => item.Type === "WORD" || item.Type === "LINE")
    .map(item => item.DetectedText);

  return [...new Set(extractedText)].join(" "); // Remove duplicates
};
