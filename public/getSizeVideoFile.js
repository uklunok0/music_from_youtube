const ytdl = require("ytdl-core");

const getFileSize = async (link) => {
  try {
    const info = await ytdl.getInfo(link);
    const fileSize = parseInt(info.formats[0].contentLength);
    return fileSize;
  } catch (error) {
    console.error(error);
    return 0;
  }
};

module.exports = getFileSize;
