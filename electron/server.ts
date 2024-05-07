//@ts-nocheck
import child_process from "child_process"; // To be used later for running FFmpeg
import express from "express";
import { Server } from "socket.io";
import fs from "fs";
import path from "path";
import https from "https";
import cors from "cors";

require("dotenv").config();

import { inputSettings, youtubeSettings } from "./ffmpeg";

const expressApp = express();

expressApp.use(cors());
expressApp.use(express.static("public"));
expressApp.use(express.json({ limit: "200mb", extended: true }));
expressApp.use(
  express.urlencoded({ limit: "200mb", extended: true, parameterLimit: 50000 })
);

import authenticationRouter from "./routes/authentication.js";
import broadcastsRouter from "./routes/broadcasts.js";
import compareCodeRouter from "./routes/compareCode.js";
import destinationsRouter from "./routes/destinations.js";
import emailEventNotificationsRouter from "./routes/emailEventNotifications.js";
import hubspotRouter from "./routes/hubspot.js";
import referralRouter from "./routes/referral.js";
import stripeRouter from "./routes/stripe.js";
import facebookAuthorizationRouter from "./routes/facebookAuthorization.js";
import facebookBroadcastRouter from "./routes/facebookBroadcast.js";
import facebookViewCountRouter from "./routes/facebookViewCount.js";
import twitchAuthorizationRouter from "./routes/twitchAuthorization.js";
import twitchBroadcastRouter from "./routes/twitchBroadcast.js";
import twitchViewCountRouter from "./routes/twitchViewCount.js";
import youtubeAuthorizationRouter from "./routes/youtubeAuthorization.js";
import youtubeBroadcastRouter from "./routes/youtubeBroadcast.js";
import youtubeViewCountRouter from "./routes/youtubeViewCount.js";

expressApp.use("/", authenticationRouter);
expressApp.use("/", broadcastsRouter);
expressApp.use("/", compareCodeRouter);
expressApp.use("/", destinationsRouter);
expressApp.use("/", emailEventNotificationsRouter);
expressApp.use("/", facebookAuthorizationRouter);
expressApp.use("/", facebookBroadcastRouter);
expressApp.use("/", facebookViewCountRouter);
expressApp.use("/", hubspotRouter);
expressApp.use("/", twitchAuthorizationRouter);
expressApp.use("/", twitchBroadcastRouter);
expressApp.use("/", twitchViewCountRouter);
expressApp.use("/", referralRouter);
expressApp.use("/", stripeRouter);
expressApp.use("/", youtubeAuthorizationRouter);
expressApp.use("/", youtubeBroadcastRouter);
expressApp.use("/", youtubeViewCountRouter);

const PORT = process.env.PORT || 5001;
const WS_PORT = process.env.PORT || 3001;

// expressApp.listen(PORT, () => {
//   console.log(`Listening on PORT ${PORT} for REST API requests`);
// });

// const wss = new WebSocket.Server({ port: WS_PORT }, () => {
//   console.log(`Listening on PORT ${WS_PORT} for websockets`)
// })

const options = {
  key: fs.readFileSync(path.join(__dirname, "../", "./electron/cert/key.pem")),
  cert: fs.readFileSync(
    path.join(__dirname, "../", "./electron/cert/cert.pem")
  ),
};

const sslServer = https.createServer(options, expressApp);

const io = new Server(sslServer, {
  /* options */
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("socket: ", socket);
  console.log(`socket connected to ${socket.id}`);

  const socketQueryParams = socket.handshake.query;
  console.log("socketQueryParams: ", socketQueryParams);

  const youtube = socketQueryParams.youtubeUrl;
  console.log("youtube: ", youtube);
  // const twitchStreamKey = socketQueryParams.twitchStreamKey;
  // const twitch = twitchStreamKey !== "null" ? "rtmp://dfw.contribute.live-video.net/expressApp/" + twitchStreamKey : null;
  // const twitchUsername = socketQueryParams.twitchUsername;

  // const facebook = socketQueryParams.facebookUrl;

  // const customRTMP = socketQueryParams.customRTMP;
  // console.log("twitchUsername: " + twitchUsername);

  // TWITCH CHAT TMI.JS

  // const client = new tmi.Client({
  //   channels: [twitchUsername],
  // })

  // client.connect()

  // client.on('message', (channel, tags, message, self) => {
  //   console.log(`${tags['display-name']}: ${message}`)
  //   socket.emit('twitch-msg', `${tags['display-name']}: ${message}`)
  // })

  // END TWITCH CHAT TMI.JS

  const ffmpegInput = inputSettings.concat(
    youtubeSettings(youtube)
    // twitchSettings(twitch),
    // facebookSettings(facebook),
    // customRtmpSettings(customRTMP)
  );

  // console.log(ffmpegInput)

  // const ffmpeg = child_process.spawn(
  //   'ffmpeg',
  //   ffmpeg2(youtube, twitch, facebook)
  // )
  const ffmpeg = child_process.spawn("ffmpeg", ffmpegInput);

  // If FFmpeg stops for any reason, close the WebSocket connection.
  ffmpeg.on("close", (code, signal) => {
    console.log(
      "FFmpeg child process closed, code " + code + ", signal " + signal
    );
    // ws.terminate()
  });

  // Handle STDIN pipe errors by logging to the console.
  // These errors most commonly occur when FFmpeg closes and there is still
  // data to write.  If left unhandled, the server will crash.
  ffmpeg.stdin.on("error", (e) => {
    console.log("FFmpeg STDIN Error", e);
  });

  // FFmpeg outputs all of its messages to STDERR.  Let's log them to the console.
  ffmpeg.stderr.on("data", (data) => {
    console.log("FFmpeg STDERR:", data.toString());
  });

  // When data comes in from the WebSocket, write it to FFmpeg's STDIN.
  socket.on("message", (msg) => {
    console.log("DATA", msg);
    ffmpeg.stdin.write(msg);
  });
  socket.on("hello", (msg) => {
    console.log("hello", msg);
  });

  // If the client disconnects, stop FFmpeg.
  socket.conn.on("close", (e) => {
    console.log("kill: SIGINT, soocket closed");
    ffmpeg.kill("SIGINT");
  });
});

// httpServer.listen(3001);
export default sslServer;
