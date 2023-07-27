// получить элементы формы
const form = document.querySelector("#getLink");
const nameInput = document.querySelector("#nameInput");
const resultDiv = document.getElementById("result");
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
    resultDiv.innerHTML !== "Это не ссылка YouTube!"
  ) {
    console.log("win!");

    const btn = document.createElement("button"); // создать кнопку если ответ от youtube успешный
    btn.innerHTML = "Подтвердить";
    btn.id = "confirmButton";
    divBtn.appendChild(btn);

    btn.addEventListener("click", btnSubmit); // вызов ф-ции для запуска скачивания файла

    // if (downloadLink) { автоматический вызов окна сохранения
    //   downloadLink.addEventListener("click", function () {});
    //   downloadLink.click();
    // }
  }
}

// Обработчик события клика по кнопке формы
const handleSubmit = async function (e) {
  e.preventDefault();
  resultDiv.innerHTML = "";

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

  const data = {
    name: nameInput.value,
  };

  await sendRequestAndUpdateResult("/data", data);
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
