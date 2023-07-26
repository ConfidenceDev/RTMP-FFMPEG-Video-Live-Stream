# RTMP-FFMPEG-Video-Live-Stream

Building a Video Live Streaming Service for Event Creators

# How To Use

<b>Local</b> <br />

1. Install <b>FFMPEG</b> on your local machine, you can search on google.
   For Linux:

```
sudo apt update && sudo apt upgrade
sudo apt install ffmpeg
ffmpeg -version
```

2. Run project:

- Clone or download repo and unzip
- Install packages

```
npm install
```

- Add your cloudinary config to store video after stream to storage or comment out code

```
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
```

- Run the demo: http://localhost:5000

3. RTMP Stream:

- Start the rtmp server to allow subscribers watch streams
- <a href="https://github.com/ConfidenceDev/RTMP-Live-Stream-Server">https://github.com/ConfidenceDev/RTMP-Live-Stream-Server</a>
- Update <b>rtmpUrl</b> in <b>app.js</b> code if RTMP server is not running on localhost (Eg: If running rtmp server in a container, change rtmp url with conatiner IP Address and port or setup a docker network)

4. Watch Stream:

- Use any client that can play rtmp stream and pass the url:
  <b>rtmp://localhost/live/stream</b>
- Use VLC: Open VLC -> Select Media -> Select Open Network Stream and paste stream url.

<br />

<b>Docker</b>

1. build docker image

```
docker build -t <image-name> .
```

2. Start container:

```
docker run -p 5000:5000 -d --name <container-name> <image-name>:latest
```
