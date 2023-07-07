const axios = require("axios");
const cheerio = require("cheerio");

const getTitle = async (link) => {
  // ф-ция получения названия файла
  try {
    const response = await axios.get(link);
    const $ = cheerio.load(response.data);
    linkYoutube = $("title").text().replace(" - YouTube", "");
    //console.log(linkYoutube);
    return linkYoutube;
  } catch (error) {
    console.log(error);
  }
};

module.exports = getTitle;
