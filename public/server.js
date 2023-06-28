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

//link = "https://www.youtube.com/watch?v=UMER76w9ew8";
//const url = "http://localhost:3000";

let linkYoutube = "";
let validate;

app.set("view engine", "ejs");

// обработчик GET-запроса на index.html
app.get("/", (req, res) => {
  res.render("index.ejs");
});

// Подключение статической папки
app.use(express.static("public"));

// используем middleware body-parser для обработки POST-запросов
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// обработчик POST-запроса на сервер

app.post("/", (req, res) => {
  let link = req.body.name; // содержит введённые данные в форму

  function validateUrl(data) {
    // ф-ция проверки корректного ввода данных в форму
    validate = 0;
    if (!data) {
      //res.render("code400.ejs");
      let responseHTML = "Данные не введены!";
      res.send(responseHTML);

      return false;
    }

    const isUrlValid = /^https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/i.test(data); // проверяем, соответствует ли переданный URL стандартам URL
    if (!isUrlValid) {
      //res.render("code404.ejs");
      responseHTML = "Некорректный URL!";
      res.send(responseHTML);
      return false;
    }

    console.log(data);
    let videoId = ytdl.getURLVideoID(data);
    console.log("ID video:", videoId);
    validate++;
  }

  validateUrl(link);

  const getTitle = async (link) => {
    // ф-ция получения названия файла
    try {
      const response = await axios.get(link);
      const $ = cheerio.load(response.data);
      linkYoutube = $("title").text().replace(" - YouTube", "");
      console.log(linkYoutube);
      return false;
    } catch (error) {
      console.log(error);
    }
  };

  if (validate == 1) getTitle(link);
  else return false;

  setTimeout(() => {
    console.log(linkYoutube);
    const responseHTML = `Название видео:<br>${linkYoutube}`;

    res.send(responseHTML); // отправить данные в форму в div #result
  }, 1500);

  /*const getStream = async (link, linkYoutube) => {
    // ф-ция получения и обработки видеопотока

    try {
      let stream = await ytdl(link, { quality: "highestaudio" }); // получить видеопоток по ссылке
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
          //res.send(`\ndone, thanks - ${(Date.now() - start) / 1000}s`);
          res.render("downloadComplete.ejs", {
            downloadComplete: `\ndone, thanks - ${
              (Date.now() - start) / 1000
            }s`,
          });
        });
    } catch (error) {
      console.log(error);
    }
  };

  setTimeout(function () {
    getStream(link, linkYoutube);
  }, 2000); */
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}. Listening...`);
});
