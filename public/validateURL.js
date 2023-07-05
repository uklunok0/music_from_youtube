const ytdl = require("ytdl-core");
function validateUrl(data, req, res) {
  // ф-ция проверки корректного ввода данных в форму
  let validate = 0;
  if (!data) {
    //res.render("code400.ejs");
    let responseHTML = "Данные не введены!";

    setTimeout(() => {
      res.send(responseHTML); // задержка вывода сообщения
    }, 100);
    return validate--;
  }

  const isUrlValid = /^https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/i.test(data); // проверяем, соответствует ли переданный URL стандартам URL
  if (!isUrlValid) {
    //res.render("code404.ejs");
    responseHTML = "Некорректный URL!";

    setTimeout(() => {
      res.send(responseHTML); // задержка вывода сообщения
    }, 100);
    return validate--;
  }

  const notYouTubeLink = data.substring(0, 20);
  if (
    notYouTubeLink !== "https://www.youtube." &&
    notYouTubeLink !== "https://youtube.com/"
  ) {
    responseHTML = "Это не ссылка YouTube!";

    setTimeout(() => {
      res.send(responseHTML); // задержка вывода сообщения
    }, 100);
    return validate--;
  }

  console.log(data);
  let videoId = ytdl.getURLVideoID(data);
  console.log("ID video:", videoId);
  validate++;
  console.log(validate);
  return validate;
}

module.exports = validateUrl;
