const express = require("express");
const bodyParser = require("body-parser");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const readline = require("readline");
const axios = require("axios");
const cheerio = require("cheerio");
const path = require("path");

const app = express();
const port = 3000;

//const url = "https://www.youtube.com/watch?v=UMER76w9ew8";

let linkYoutube = "";

// обработчик GET-запроса на index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// используем middleware body-parser для обработки POST-запросов
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// обработчик POST-запроса на сервер
app.post("/", (req, res) => {
  let link = req.body.nameInput; // содержит введённые данные в форму
  if (!link) {
    res.status(400).send("Данные не введены");
    return;
  }
  console.log(link);
  let videoId = ytdl.getURLVideoID(link);
  console.log("ID video:", videoId);

  const getTitle = async (link) => {
    // ф-ция получения названия файла
    try {
      const response = await axios.get(link);
      const $ = cheerio.load(response.data);
      linkYoutube = $("title").text().replace(" - YouTube", "");
      return linkYoutube;
    } catch (error) {
      console.log(error);
    }
  };
  getTitle(link).then((linkYoutube) => console.log(linkYoutube)); // вывод названия в консоль

  setTimeout(function () {
    // задержка обработки запроса

    let stream = ytdl(link, { quality: "highestaudio" }); // получить видеопоток по ссылке
    ffmpeg.setFfmpegPath(
      "C:/JS-PROGECTS/mp3_from_youtube/ffmpeg/bin/ffmpeg.exe"
    );
    let start = Date.now();
    ffmpeg(stream) // преобразование видеопотока в *mp3
      .audioBitrate(320)
      .save(
        "C:/JS-PROGECTS/mp3_from_youtube/tmp_from_youtube/" +
          `${linkYoutube}.mp3`
      )
      .on("progress", (p) => {
        readline.cursorTo(process.stdout, 0); // перемещает курсор в начало строки
        process.stdout.write(`${p.targetSize}kb downloaded`);
      })
      .on("end", () => {
        console.log(`\ndone, thanks - ${(Date.now() - start) / 1000}s`);
        res.send(`\ndone, thanks - ${(Date.now() - start) / 1000}s`);
      });
  }, 2000);
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}. Listening...`);
});
