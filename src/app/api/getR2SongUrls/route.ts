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
  try {
    const { objectKeys } = await request.json(); // objectKeys should be an array of object names

    const urls = await Promise.all(objectKeys.map(async (objectKey: string) => {
      const command = new GetObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET_NAME as string,
        Key: objectKey,
      });

      try {
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
        return { objectKey, url };
      } catch (error) {
        console.error(`Error creating pre-signed URL for ${objectKey}:`, error);
        return { objectKey, error: "Error creating pre-signed URL" };
      }
    }));

    return new Response(JSON.stringify(urls), { status: 200 });
  } catch (error) {
    console.error("Error in getR2SongUrls:", error);
    return new Response(JSON.stringify({ error: "Server error in getR2SongUrls" }), { status: 500 });
  }
}
