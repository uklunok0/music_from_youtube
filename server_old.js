/*const ffmpeg = require("fluent-ffmpeg");
const ytdl = require("ytdl-core");
const express = require("express");
const fileUpload = require("express-fileupload");

const app = express();

app.listen(5000, () => {
  console.log("Port 5000 is open. Listening...");
});

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/index.html");
});

app.post("/avitomp3", (request, response) => {
  response.contentType("video/avi");
  response.attachment("output.mp3");

  // uploaded file

  request.files.mp3.mv("tmp/" + request.files.mp3.name, function (err) {
    if (err) return response.sendStatus(500).send(err);
    console.log("File uploaded successfully");
  });

  // converting avi to mp3
  ffmpeg.setFfmpegPath("C:/ffmpeg/bin/ffmpeg.exe");

  ffmpeg("C:/JS-PROGECTS/mp3_from_youtube/tmp/" + request.files.mp3.name)
    .toFormat("mp3")
    .on("end", function () {
      console.log("done");
    })
    .on("error", function (error) {
      console.log("An error occured" + error.message);
    })
    .pipe(response, { end: true });
}); */

const ffmpeg = require("fluent-ffmpeg");
const ytdl = require("ytdl-core");
const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { log } = require("console");

const url = "https://www.youtube.com/watch?v=UMER76w9ew8";

const app = express();

// let stream = ytdl(url, { quality: "highestaudio" }).pipe(
//   fs.createWriteStream(
//     "C:/JS-PROGECTS/mp3_from_youtube/tmp_from_youtube/" + "/video.mp3"
//   )
// );
console.log("привет");
let videoId = ytdl.getURLVideoID(url);
console.log("ID video: ", videoId);

/*let stream = ytdl(url, { quality: "highestaudio" });

ffmpeg.setFfmpegPath("C:/ffmpeg/bin/ffmpeg.exe");
let start = Date.now();
ffmpeg(stream)
  .audioBitrate(320)
  .save("C:/JS-PROGECTS/mp3_from_youtube/tmp_from_youtube/" + `${videoId}.mp3`)
  .on("progress", (p) => {
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`${p.targetSize}kb downloaded`);
  })
  .on("end", () => {
    console.log(`\ndone, thanks - ${(Date.now() - start) / 1000}s`);
  });*/

app.listen(5000, () => {
  console.log("Port 5000 is open. Listening...");
});

app.use(express.static(path.resolve(__dirname, "static")));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.post("/avitomp3", (request, response) => {
  console.log("верно!");
  response.contentType("video/mp4");
  response.attachment("output.mp3");

  let stream = ytdl(url, { quality: "highestaudio" });

  ffmpeg.setFfmpegPath("C:/ffmpeg/bin/ffmpeg.exe");
  let start = Date.now();
  ffmpeg(stream)
    .audioBitrate(320)
    .save(
      "C:/JS-PROGECTS/mp3_from_youtube/tmp_from_youtube/" + `${videoId}.mp3`
    )
    .on("progress", (p) => {
      readline.cursorTo(process.stdout, 0);
      process.stdout.write(`${p.targetSize}kb downloaded`);
    })
    .on("end", () => {
      console.log(`\ndone, thanks - ${(Date.now() - start) / 1000}s`);
    });
});

// uploaded file

/*request.files.mp3.mv("tmp/" + request.files.mp3.name, function (err) {
    if (err) return response.sendStatus(500).send(err);
    console.log("File uploaded successfully");
  });

  // converting avi to mp3
  //ffmpeg.setFfmpegPath("C:/ffmpeg/bin/ffmpeg.exe");

  ffmpeg("C:/JS-PROGECTS/mp3_from_youtube/tmp/" + request.files.mp3.name)
    .toFormat("mp3")
    .on("end", function () {
      console.log("done");
    })
    .on("error", function (error) {
      console.log("An error occured" + error.message);
    })
    .pipe(response, { end: true });
}); */
