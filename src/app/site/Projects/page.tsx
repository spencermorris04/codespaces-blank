// Import necessary modules and components
import { createClient } from '~/util/supabase/server'; // Adjust path as necessary
import { db } from '~/db/index'; // Adjust paths as necessary
import { songs as songsSchema } from '~/db/schema';
import { eq } from 'drizzle-orm';
import SongCardsView from '~/components/SongCardsView'; // Assuming this is a server component or adapted for server use
// Import necessary AWS SDK modules
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import Link from 'next/link';

// Initialize the S3 client outside of your function to avoid re-initializing it on each call
const s3Client = new S3Client({
  region: "auto", // Adjust as necessary
  endpoint: process.env.NEXT_PUBLIC_CLOUDFLARE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  },
});

// main export
export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  // Set default url search param
  const titleSearch = (searchParams?.title || '') as string;

  // Redirect if not authenticated
  if (error || !data?.user) {
    return <p>User not authenticated. Redirecting...</p>; // Implement redirection logic as needed
  }

  const userId = data.user.id;
  const songs = await fetchUserSongs(userId);

  // Assuming `SongCardsView` can be dynamically imported if it's a client component
  return (
    <>
      <div className="mx-4">
        <SongCardsView songs={songs} title={titleSearch} loading={false} />
      </div>
    </>
  );
}

async function fetchUserSongs(userId) {
  try {
    const songRecords = await db.select({
      id: songsSchema.id,
      songTitle: songsSchema.songTitle,
      r2Id: songsSchema.r2Id,
      uploaderUserId: songsSchema.uploaderUserId,
      genre: songsSchema.genre,
      instruments: songsSchema.instruments,
      contribution: songsSchema.contribution,
      description: songsSchema.description,
      lyrics: songsSchema.lyrics,
      timedQuestions: songsSchema.timedQuestions,
      endOfSongQuestions: songsSchema.endOfSongQuestions,
    }).from(songsSchema).where(eq(songsSchema.uploaderUserId, userId));

    // Generate pre-signed URLs for each song
    const songsWithUrls = await Promise.all(songRecords.map(async (song) => {
      const url = await generatePresignedUrl(song.r2Id);

      // Use the questions directly without parsing, assuming they are already in the correct format
      return {
        ...song,
        presignedUrl: url,
        // Directly use the properties as they should already be in the correct format
        questions: [
          ...(song.timedQuestions || []),
          ...(song.endOfSongQuestions || []),
        ],
      };
    }));

    return songsWithUrls;
  } catch (error) {
    console.error("Error retrieving songs for user:", error);
    return []; // Handle errors appropriately
  }
}


async function generatePresignedUrl(objectKey) {
  const command = new GetObjectCommand({
    Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
    Key: objectKey,
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
    return url;
  } catch (error) {
    console.error(`Error creating pre-signed URL for ${objectKey}:`, error);
    return ""; // Return an empty string or handle the error as you see fit
  }
}