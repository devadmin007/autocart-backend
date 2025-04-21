import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "./aws-config.js";

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

// Validate Base64 Image Format
export const validateBase64Image = (base64String) => {
  const match = base64String.match(/^data:image\/(jpeg|jpg|png);base64,(.+)$/);
  if (!match) return { isValid: false, error: "Only JPG, JPEG, or PNG allowed." };

  return { isValid: true, format: match[1], base64Data: match[2] };
};

// Upload Image to S3
export const uploadBase64ToS3 = async (base64Data, format) => {
  const buffer = Buffer.from(base64Data, "base64");
  const fileName = `uploads/${Date.now()}.${format}`;

  const uploadParams = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: buffer,
    ContentType: `image/${format}`,
  };

  await s3Client.send(new PutObjectCommand(uploadParams));

  // Generate Signed URL
  const signedUrl = await getSignedUrl(
    s3Client,
    new GetObjectCommand({ Bucket: BUCKET_NAME, Key: fileName }),
    { expiresIn: 3600 }
  );

  return { fileName, signedUrl };
};
