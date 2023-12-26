import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.NEXT_PUBLIC_CLOUDFLARE_ENDPOINT as string,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY as string,
  },
});

export async function POST(request: Request) {
  const { objectName } = await request.json(); // Extract objectName from the request body

  const command = new GetObjectCommand({
    Bucket: process.env.CLOUDFLARE_BUCKET_NAME as string,
    Key: objectName, // Use objectName as the key
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
    return new Response(JSON.stringify({ url }), { status: 200 });
  } catch (error) {
    console.error("Error creating pre-signed URL for download:", error);
    return new Response(JSON.stringify({ error: "Error creating pre-signed URL for download" }), { status: 500 });
  }
}
