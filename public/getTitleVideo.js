const axios = require("axios");
const cheerio = require("cheerio");

const getTitle = async (link) => {
  // ф-ция получения названия файла
  try {
    const response = await axios.get(link);
    const $ = cheerio.load(response.data);
    videoTitle = $("title").text().replace(" - YouTube", "");
    return videoTitle;
  } catch (error) {
    console.error(error);
    return 0;
  }
};

module.exports = getTitle;
