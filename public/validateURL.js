function validateUrl(data) {
  // ф-ция проверки корректного ввода данных в форму
  let validate = 0;
  if (!data) {
    //res.render("code400.ejs");
    let responseHTML = "Данные не введены!";
    return responseHTML;
  }

  const isUrlValid = /^https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/i.test(data); // проверяем, соответствует ли переданный URL стандартам URL
  if (!isUrlValid) {
    //res.render("code404.ejs");
    responseHTML = "Некорректный URL!";
    return responseHTML;
  }

  const notYouTubeLink = data.substring(0, 20);
  if (
    notYouTubeLink !== "https://www.youtube." &&
    notYouTubeLink !== "https://youtube.com/"
  ) {
    responseHTML = "Это не ссылка YouTube!";
    return responseHTML;
  }

  validate++;
  console.log(validate);
  return validate;
}

module.exports = validateUrl;
