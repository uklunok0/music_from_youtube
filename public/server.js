const express = require("express");
const bodyParser = require("body-parser");
const ytdl = require("node-ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const readline = require("readline");
const path = require("path");
const fs = require("fs");
const os = require("os");

const validateUrl = require("./validateURL");
const getTitle = require("./getTitleVideo");
const getVideoInfo = require("./getVideoInfo");

const app = express();
const port = 3000;

//let videoTitle = "";
let tempNameFile;

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

  // linkYoutube.then((linkYoutube) => {
  //   const responseHTML = `Название видео:<br>${linkYoutube}  `;
  //   res.send(responseHTML); // отправить данные в форму в div #result
  // });
});

app.post("/data", (req, res) => {
  let link = req.body.name; // содержит введённые данные в форму
  const dataCut = link.substring(0, 12);
  if (dataCut == "www.youtube.") {
    link = "http://" + link;
  }

  const getStream = async (link) => {
    // ф-ция получения и обработки видеопотока
    tempNameFile = generateRandomName();
    const setFfmpegPath = selFfmpegPath();
    try {
      let stream = await ytdl(link, { quality: "highestaudio" }); // получить видеопоток по ссылке
      ffmpeg.setFfmpegPath(setFfmpegPath);

      const currentPath = path.join(
        __dirname,
        "Downloads",
        `${tempNameFile}.mp3`
      );
      let start = Date.now();
      ffmpeg(stream) // преобразование видеопотока в *mp3
        .audioBitrate(320)
        .save(currentPath)
        .on("progress", (p) => {
          readline.cursorTo(process.stdout, 0); // перемещает курсор в начало строки
          process.stdout.write(`${p.targetSize}kb downloaded`);
        })
        .on("end", () => {
          console.log(`\ndone, thanks - ${(Date.now() - start) / 1000}s`);
          responseHTML = `\nФайл успешно скачан, затрачено времени - ${
            (Date.now() - start) / 1000
          }s`;
          res.send(responseHTML);
        });
    } catch (error) {
      console.error("Ошибка при скачивании файла:", error);
    }
  };

  getStream(link);
});

app.get("/download", async (req, res) => {
  const currentPath = path.join(__dirname, "Downloads", `${tempNameFile}.mp3`);

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

  /* ffmpeg.setFfmpegPath("./ffmpeg/bin/ffmpeg.exe");
  const link = req.query.link;
  
  try {
    const info = await ytdl.getInfo(link);
    const format = ytdl.chooseFormat(info.formats, {
      filter: "audioonly",
      quality: "highestaudio",
    });
    
    const stream = ytdl.downloadFromInfo(info, { format: format });
    
    ffmpeg(stream)
    .output("output.mp3") // здесь можно задать другое имя выходного файла
    .on("end", () => {
        const file = fs.createReadStream("output.mp3");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="output.mp3"'
          );
          file.pipe(res);
        })
        .run();
      } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred");
      } */
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
