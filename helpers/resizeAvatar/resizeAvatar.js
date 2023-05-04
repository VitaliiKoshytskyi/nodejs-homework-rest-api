const jimp = require("jimp")

const resizeAvatar = async (file) => {
    const avatar = await jimp.read(file);
    await avatar.resize(250, 250);
    await avatar.writeAsync(file);
}

module.exports = resizeAvatar;