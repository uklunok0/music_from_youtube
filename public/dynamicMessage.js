// получить элементы формы
const form = document.querySelector("#getLink");
const nameInput = document.querySelector("#nameInput");
//const resultDiv = document.getElementById("result");
const resultDiv = document.createElement("div");
const divBtn = form.getElementsByClassName("main-form__column")[1];

const downloadLink = document.querySelector('a[href="/download"]');
const statusElement = document.getElementById("status");

async function sendRequestAndUpdateResult(url, data) {
  try {
    const statusIntervalId = showAnimation();

    // Отправка запроса к серверу с данными из формы и получение результата от сервера
    const response = await axios.post(url, data);
    const resultData = response.data;

    // Обновление содержимого элемента div с заданным id с результатом работы функции на сервере
    resultDiv.innerHTML = resultData;

    // Создаем элемент плашки
    resultDiv.className = "message";

    // Добавляем элемент плашки в контейнер
    const container = document.getElementById("container");
    container.appendChild(resultDiv);

    const resultDataCut = resultData.substring(0, 8);
    if (resultDataCut == "Название") {
      console.log("win2!");
      nameInput.setAttribute("readonly", true);
    }
    clearInterval(statusIntervalId);
    statusElement.innerHTML = "";
  } catch (error) {
    console.error(error);
  }
}

function checkDivIsNotEmpty() {
  if (
    resultDiv &&
    resultDiv.innerHTML !== "Некорректный URL!" &&
    resultDiv.innerHTML !== "Данные не введены!" &&
    resultDiv.innerHTML !== "Это не ссылка YouTube!" &&
    resultDiv.innerHTML !== "Попробуйте что-нибудь другое ☹" &&
    resultDiv.innerHTML !== "Файл много весит, скачайте другое ☹"
  ) {
    console.log("win!");

    const btn = document.createElement("button"); // создать кнопку если ответ от youtube успешный
    btn.innerHTML = "Скачать";
    btn.id = "confirmButton";
    divBtn.appendChild(btn);

    btn.addEventListener("click", btnSubmit); // вызов ф-ции для запуска скачивания файла
  } else {
    resultDiv.addEventListener("click", () => {
      resultDiv.innerHTML = "";
    });
  }
}

// Обработчик события клика по кнопке формы
const handleSubmit = async function (e) {
  e.preventDefault();
  resultDiv.innerHTML = "";
  resultDiv.remove();

  const data = {
    name: nameInput.value,
  };

  const dataCut0 = data.name.substring(0, 20);
  const dataCut1 = data.name.substring(0, 12);

  if (
    dataCut0 == "https://www.youtube." ||
    dataCut0 == "https://youtube.com/" ||
    dataCut1 == "www.youtube."
  ) {
    document.getElementById("submitButton").remove(); // удалить кнопку если запрос отправлен на youtube
  } else {
    console.log(dataCut0 || dataCut1);
  }

  await sendRequestAndUpdateResult("/", data); // отправить запрос на локальный сервер и вывести результат на страницу
  await checkDivIsNotEmpty(data); // если url корректный создать кнопку подтвержения
};

form.addEventListener("submit", handleSubmit);

// Обработчик события клика по созданной кнопке для отправки запроса на youtube
const btnSubmit = async function () {
  console.log("win-0!");
  document.getElementById("confirmButton").remove(); // удалить кнопку если запрос отправлен на youtube на скачивание
  resultDiv.innerHTML = "Дождитесь загрузки файла на сервер!";
  const data = {
    name: nameInput.value,
  };

  await sendRequestAndUpdateResult("/data", data);

  if (downloadLink) {
    // автоматический вызов окна сохранения
    downloadLink.addEventListener("click", function () {});
    downloadLink.click();
  }
};

// анимация в момент запроса данных
function showAnimation() {
  let animation = "pending";
  let intervalId = setInterval(() => {
    statusElement.innerHTML = animation;
    animation += ".";
    if (animation.length > 10) {
      animation = "pending";
    }
  }, 200);

  return intervalId;
}
