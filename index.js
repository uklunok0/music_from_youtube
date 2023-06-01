const express = require("express");
const bodyParser = require("body-parser");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const readline = require("readline");

const app = express();
const port = 3000;

//const url = "https://www.youtube.com/watch?v=UMER76w9ew8";

app.get("/", (req, res) => {
  const form = `
  <form method="post" action="/">
  <label for="name">Name:</label>
  <input type="text" id="name" name="name"><br><br>
  <button type="submit">Send Message</button>
  </form>
  `;
  res.send(form);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/", (req, res) => {
  let link = req.body.name;
  console.log(link); // содержит введённые данные в форму
  let videoId = ytdl.getURLVideoID(link);
  console.log("ID video: ", videoId);

  let stream = ytdl(link, { quality: "highestaudio" });
  ffmpeg.setFfmpegPath("C:/JS-PROGECTS/mp3_from_youtube/ffmpeg/bin/ffmpeg.exe");
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
      res.send(`\ndone, thanks - ${(Date.now() - start) / 1000}s`);
    });
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
