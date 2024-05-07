import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config()


const bindYoutubeBroadcastToStream = async (
  youtubeBroadcastId,
  youtubeStreamId,
  youtubeAccessToken
) => {
  const config = {
    headers: {
      Authorization: `Bearer ${youtubeAccessToken}`,
      Accept: 'application/json',
    },
  }

  const bindedBroadcast = await axios.post(
    `https://youtube.googleapis.com/youtube/v3/liveBroadcasts/bind?id=${youtubeBroadcastId}&part=snippet&streamId=${youtubeStreamId}&access_token=${youtubeAccessToken}&key=${process.env.GOOGLE_API_KEY}`,
    config
  )

  return bindedBroadcast
}

export default bindYoutubeBroadcastToStream
