import type { NextApiHandler } from 'next';
import { Innertube } from 'youtubei.js';

const getYoutubeUrl: NextApiHandler = async (req, res) => {
  const { videoId } = req.query;

  if (!videoId || typeof videoId !== 'string') {
    return res.status(400).json({ error: 'A valid video ID is required' });
  }

  try {
    const youtube = await Innertube.create();
    const videoInfo = await youtube.getInfo(videoId as string);

    // Assuming there's no need to modify URLs for CORS, directly convert to MPEG-DASH manifest
    const manifest = await videoInfo.toDash();

    // Send the manifest as the response with appropriate content type
    res.setHeader('Content-Type', 'application/dash+xml');
    res.status(200).send(manifest);
  } catch (error) {
    console.error('Failed to retrieve MPEG-DASH manifest:', error);
    res.status(500).json({ error: 'Failed to retrieve video information' });
  }
};

export default getYoutubeUrl;