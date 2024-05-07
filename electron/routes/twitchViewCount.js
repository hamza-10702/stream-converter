import dotenv from 'dotenv';
import { Router } from 'express';
import axios from 'axios';

dotenv.config();

const router = Router();
router.post('/api/twitch/view-count', async (req, res) => {
  // twitch forum: https://discuss.dev.twitch.tv/t/viewer-counter-help/24726/2

  // https://discuss.dev.twitch.tv/t/getting-stream-viewer-count-webhook-notifications/20645/5

  const twitchUsername = req.body.twitchUsername
  const twitchAccessToken = req.body.twitchAccessToken

  let viewCount = await axios
    .get(`https://api.twitch.tv/helix/streams?user_login=${twitchUsername}`, {
      headers: {
        Authorization: `Bearer ${twitchAccessToken}`,
        'Client-Id': process.env.TWITCH_CLIENT_ID,
        'Content-Type': 'application/json',
      },
    })
    .then((res) => {
      console.log(res.data.data[0].viewer_count)
      return res.data.data[0].viewer_count
    })
    .catch((err) => {
      console.log(err)
    })

  return res.status(201).send({ number: viewCount })
})

export default router
