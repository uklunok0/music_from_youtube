const express = require("express");
const bodyParser = require("body-parser");
const ytdl = require("node-ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const readline = require("readline");
const path = require("path");
const fs = require("fs");
const os = require("os");

const validateUrl = require("./public/validateURL");
const getTitle = require("./public/getTitleVideo");
const getVideoInfo = require("./public/getVideoInfo");

const app = express();
const port = 3000;

//let videoTitle = "";
let tempNameFile;
let targetSize = 0; // прогресс загрузки файла на сервер

// подключение шаблонизатора
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
  const link = req.body.name; // содержит введённые данные в форму
  const dataCut = link.substring(0, 12);
  if (dataCut == "www.youtube.") {
    // привести url к стандарту
    link = "https://" + link;
  }

  let validate = validateUrl(link); // проверить введённый URL

  if (validate !== 1) {
    const responseHTML = validate;
    setTimeout(() => {
      res.send(responseHTML); // отправить данные в форму в div #result с кривым URL
    }, 100);
  } else {
    async function getInfoFile() {
      try {
        const videoTitle = await getTitle(link); // выполнять только после проверки введённых данных, ф-ция получения названия
        if (!videoTitle) {
          const responseHTML = "Попробуйте что-нибудь другое ☹";
          res.send(responseHTML);
        } else {
          const infoFile = await getVideoInfo(link); // выполнять только после проверки введённых данных, ф-ция получения размер
          console.log(infoFile);

          if (infoFile[2] > 140) {
            const responseHTML = "Файл много весит, скачайте другой ☹";
            res.send(responseHTML);
          } else {
            const responseHTML = `Название видео:<br>${videoTitle}<br>Размер файла:<br>~ ${infoFile[0]} кбайт<br>Длительность:<br>${infoFile[2]}min ${infoFile[3]}s<br><img src ="${infoFile[1]}" style="width: 225px; height: 125px;"/>`;

            res.send(responseHTML); // отправить данные в форму в div #result
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
    getInfoFile();
  }
});

/*
class StreamDownloader {
  constructor(link, res) {
    this.link = link;
    this.res = res;
    this.tempNameFile = this.generateRandomName();
    this.setFfmpegPath = this.selFfmpegPath();
    this.targetSize = 0;
  }

  async download() {
    try {
      let stream = await ytdl(this.link, { quality: "highestaudio" });
      const currentPath = path.join(
        __dirname,
        "Downloads",
        `${this.tempNameFile}.mp3`
      );
      let start = Date.now();

      ffmpeg.setFfmpegPath(this.setFfmpegPath);
      const ffmpegInstance = ffmpeg(stream)
        .audioBitrate(320)
        .save(currentPath)
        .on("progress", (p) => {
          console.log("hello");
          console.log("p:", p);
          readline.cursorTo(process.stdout, 0);
          process.stdout.write(`\n${p.targetSize}kb downloaded`);
          this.targetSize = p.targetSize;
        })
        .on("end", () => {
          ffmpegInstance.removeAllListeners("progress");

          this.targetSize = 1111;
          console.log(`\ndone, thanks - ${(Date.now() - start) / 1000}s`);
          const responseHTML = `\nФайл успешно скачан, затрачено времени - ${
            (Date.now() - start) / 1000
          }s`;
          this.res.send(`data: ${responseHTML}`);
          // Удаляем обработчики событий после завершения скачивания
        });
    } catch (error) {
      console.error("Ошибка при скачивании файла:", error);
    }
  }

  generateRandomName() {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    let name = "";

    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * alphabet.length);
      name += alphabet[randomIndex];
    }

    return name;
  }

  selFfmpegPath() {
    // Определяем путь к исполняемому файлу ffmpeg в зависимости от операционной системы
    let ffmpegPath = "";
    console.log(os.platform());

    if (os.platform() === "win32") {
      ffmpegPath = "./ffmpeg/bin/ffmpeg.exe"; // Путь к ffmpeg для Windows
    } else if (os.platform() === "linux") {
      ffmpegPath = "/usr/bin/ffmpeg"; // Путь к ffmpeg для Linux (это общепринятый путь, но он может быть разным)
    }
    return ffmpegPath;
  }
}

const downloadMedia = new StreamDownloader(link, res);
downloadMedia.download(); */

// обработка запроса на скачивание файла на сервер
app.post("/data", (req, res) => {
  const link = req.body.name; // содержит введённые данные в форму
  const dataCut = link.substring(0, 12);
  if (dataCut == "www.youtube.") {
    link = "https://" + link;
  }

  let progressHandler; // переменная для хранения обработчика прогресса

  // обработчик прогресса
  progressHandler = (p) => {
    console.log(p);
    process.stdout.write(`${p.targetSize}kb downloaded`);
    targetSize = p.targetSize;
    console.log(targetSize);
  };

  // функция получения и обработки видеопотока
  tempNameFile = generateRandomName(); // случайное название файла
  const setFfmpegPath = selFfmpegPath(); // задать путь к библиотеке
  const currentPath = path.join(__dirname, "./public/Downloads", `${tempNameFile}.mp3`);
  let start = Date.now();
  ffmpeg.setFfmpegPath(setFfmpegPath);

  const getStream = async (link) => {
    let stream = await ytdl(link, { quality: "highestaudio" }); // получить видеопоток по ссылке

    const ffmpegInstance = ffmpeg(stream) // преобразование видеопотока в *mp3
      .audioBitrate(320)
      .save(currentPath)
      .on("progress", progressHandler)
      .on("end", () => {
        console.log(`\ndone, thanks - ${(Date.now() - start) / 1000}s`);
        responseHTML = `\nФайл успешно скачан, затрачено времени - ${(Date.now() - start) / 1000}s`;
        targetSize = 0;
        res.send(`data: ${responseHTML}`);
        ffmpegInstance.off("progress", progressHandler);
        if (ffmpegInstance) {
          ffmpegInstance.kill();
          console.log("killed");
        }
      })
      .on("error", (err) => {
        console.error("ffmpeg error:", err);
        res.status(500).send("Произошла ошибка при обработке видео");
      });
  };

  getStream(link);
});

// Middleware для обработки SSE
app.get("/progress", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  // Устанавливаем интервал для отправки обновлений прогресса каждые 500 миллисекунд
  const progressInterval = setInterval(() => {
    if (targetSize !== 0) {
      res.write(`data: ${targetSize} \n\n`);
    }
  }, 500);

  // Закрытие соединения SSE при завершении запроса
  req.on("close", () => {
    clearInterval(progressInterval); // очистка интервала
    res.end(); // завершение ответа
    targetSize = 0;
    console.log("target", targetSize);
  });
});

// обработка запроса на скачивание файла на локальный ПК
app.get("/download", (req, res) => {
  const currentPath = path.join(__dirname, "./public/Downloads", `${tempNameFile}.mp3`);

  res.download(currentPath, `${videoTitle}.mp3`, function (err) {
    if (err) {
      console.error("Ошибка при скачивании файла:", err);
    } else {
      fs.unlink(currentPath, function (err) {
        if (err) {
          console.error("Ошибка при удалении файла:", err);
        } else {
          console.log("Файл успешно удалён");
        }
      });
    }
  });
});

//функция создания случайного имени файла
function generateRandomName() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  let name = "";

  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    name += alphabet[randomIndex];
  }

  return name;
}

function selFfmpegPath() {
  // Определяем путь к исполняемому файлу ffmpeg в зависимости от операционной системы
  let ffmpegPath = "";
  console.log(os.platform());

  if (os.platform() === "win32") {
    ffmpegPath = "./ffmpeg/bin/ffmpeg.exe"; // Путь к ffmpeg для Windows
  } else if (os.platform() === "linux") {
    ffmpegPath = "/usr/bin/ffmpeg"; // Путь к ffmpeg для Linux (это общепринятый путь, но он может быть разным)
  }
  return ffmpegPath;
}

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}. Listening...`);
});
