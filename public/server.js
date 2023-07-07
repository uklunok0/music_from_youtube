const express = require("express");
const bodyParser = require("body-parser");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const readline = require("readline");
const { log } = require("console");

const getTitle = require("./getTitleVideo");
const validateUrl = require("./validateURL");

const app = express();
const port = 3000;

//link = "https://www.youtube.com/watch?v=UMER76w9ew8";
//const url = "http://localhost:3000";

//let linkYoutube = "";

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
  const dataCut = link.substring(0, 12);
  if (dataCut == "www.youtube.") {
    // привести url к стандарту
    link = "https://" + link;
  }

  let validate = validateUrl(link); // проверить введённый URL

  if (validate !== 1) {
    const responseHTML = validate;
    setTimeout(() => {
      res.send(responseHTML); // отправить данные в форму в div #result
    }, 100);
  } else {
    let linkYoutube = getTitle(link); // выполнять только после проверки введённых данных, ф-ция получения названия

    linkYoutube.then((linkYoutube) => {
      console.log(linkYoutube);
      const responseHTML = `Название видео:<br>${linkYoutube}`;
      res.send(responseHTML); // отправить данные в форму в div #result
    });
  }
});

app.post("/data", (req, res) => {
  let link = req.body.name; // содержит введённые данные в форму
  const dataCut = link.substring(0, 12);
  if (dataCut == "www.youtube.") {
    link = "http://" + link;
  }

  const getStream = async (link, linkYoutube) => {
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
          responseHTML = `\ndone, thanks - ${(Date.now() - start) / 1000}s`;
          res.send(responseHTML);

          // res.render("downloadComplete.ejs", {
          //   downloadComplete: responseHTML,
          // });
        });
    } catch (error) {
      console.log(error);
    }
  };
  getStream(link, linkYoutube);
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}. Listening...`);
});
