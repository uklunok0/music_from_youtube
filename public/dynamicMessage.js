// получить элементы формы
const form = document.querySelector("#getLink");
const nameInput = document.querySelector("#nameInput");
const resultDiv = document.getElementById("result");

async function sendRequestAndUpdateResult(url, data) {
  try {
    // Отправка запроса к серверу с данными из формы и получение результата от сервера
    const response = await axios.post(url, data);
    const resultData = response.data;

    // Обновление содержимого элемента div с заданным id с результатом работы функции на сервере
    resultDiv.innerHTML = resultData;

    return resultData;
  } catch (error) {
    console.error(error);
  }
}

async function checkDivIsNotEmpty(data) {
  if (
    resultDiv &&
    resultDiv.innerHTML !== "Некорректный URL!" &&
    resultDiv.innerHTML !== "Данные не введены!" &&
    resultDiv.innerHTML !== "Это не ссылка YouTube!"
  ) {
    console.log("win!");
    // Выполнение функции загрузки mp3 и вывод сообщения в #result
    await sendRequestAndUpdateResult("/data", data);
  }
}

// Обработчик события клика по кнопке формы
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  resultDiv.innerHTML = "";

  const data = {
    // объект с введёнными данными в форму
    name: nameInput.value,
  };
  // Выполнение функции проверка введённых данных и получения названия видео #result
  await sendRequestAndUpdateResult("/", data);

  await checkDivIsNotEmpty(data);
});
