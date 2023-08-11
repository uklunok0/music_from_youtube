const ytdl = require("ytdl-core");

const getVideoInfo = async (link) => {
  try {
    const info = await ytdl.getInfo(link);
    // получить заголовок видео
    const fileTitle = info.player_response.videoDetails.title;

    const lengthFile = info.player_response.videoDetails.lengthSeconds; // длительность в секундах
    const lengthFileInt = Math.floor(lengthFile / 60); // кол-во минут
    const lengthFileFloat = lengthFile % 60; // кол-во секунд

    const audioFormat = info.formats.find((format) =>
      format.mimeType.startsWith("audio/")
    );
    // получить объём аудио файла
    const fileSize = Math.floor(
      (parseInt(audioFormat.contentLength) / 1024) * 2.5
    );
    // получить превью видео
    const thumbnailUrl =
      info.player_response.videoDetails.thumbnail.thumbnails[0].url;

    return [fileSize, thumbnailUrl, lengthFileInt, lengthFileFloat];
  } catch (error) {
    console.error(error);
    return 0;
  }
};

module.exports = getVideoInfo;
