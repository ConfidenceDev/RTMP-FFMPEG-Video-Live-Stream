require("dotenv/config");
const path = require("path");
const fs = require("fs");
const express = require("express");
const app = express();
const ffmpeg = require("fluent-ffmpeg");
const { Readable } = require("stream");
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
const cloudinary = require("cloudinary").v2;

//Cloudinary configuration: https://cloudinary.com/
//Comment out code if you don't want cloud storage
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const PORT = process.env.PORT || 5000;
// RTMP Stream URL
const rtmpUrl = "rtmp://localhost/live/stream";
//const rtmpUrl = "rtmp://172.17.0.3:1935/live/stream";

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/index.html"));
});

const videoFrames = [];
const videoStream = new Readable({
  read() {}, // We will handle the reading of data in the 'data' event from Socket.io
});

let processing = false;

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("blob", async (frameData) => {
    videoFrames.push(frameData);
    videoStream.push(frameData);
    if (!processing) {
      processing = true;
      processVideoChunks();
    }
  });

  socket.on("endStream", () => {
    const currentTime = Date.now();
    const videoBuffer = Buffer.concat(videoFrames);
    const streamName = `video_${currentTime}`;
    const tempFilePath = `./videos/${streamName}.mp4`;
    fs.writeFileSync(tempFilePath, videoBuffer);
    videoFrames.length = 0;

    // Save stream to cloudinary
    // Comment out code if you don't want cloud storage
    cloudinary.uploader
      .upload(tempFilePath, {
        resource_type: "video",
        public_id: `streams/${streamName}`,
        chunk_size: 6000000,
      })
      .then((result) => {
        console.log(result);

        // Remove stream from local video folder after cloud storage
        fs.unlinkSync(tempFilePath);
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

function processVideoChunks() {
  const command = ffmpeg()
    .input(videoStream) // Set input from the temporary video chunk file
    .inputOptions(["-re"]) // Set input as realtime stream
    .videoCodec("libx264") // Use H.264 video codec
    .audioCodec("aac")
    .autopad() // Auto pad is neccessary
    //.outputOption("-movflags frag_keyframe+empty_moov")
    .outputOptions([
      "-movflags frag_keyframe+empty_moov",
      "-crf 18", // Adjust the CRF value (18 is a good trade-off between quality and file size)
      "-preset fast", // Set the encoding preset for faster processing
    ])
    .toFormat("flv")
    .output(rtmpUrl);

  // Event handling
  command.on("start", (commandLine) => {
    console.log("FFmpeg command: " + commandLine);
  });

  command.on("error", (err) => {
    console.error("Error:", err.message);
  });

  command.on("end", () => {
    console.log("Processing finished!");
    processing = false;
  });

  // Run the ffmpeg command
  command.run();
}

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
