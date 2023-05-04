const multer = require("multer");

const path = require("path");

const tempDir = path.resolve("temp");

const multerConfig = multer.diskStorage({
  destination: tempDir,
  filename: (req, file, cb) => {
    const uniquePrefix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniquePrefix}_${file.originalname}`);
  },
});

const fileTypeWhiteList = ["image/jpeg", "image/png"];

const fileFilter = (req, file, cb) => {
  const { mimetype } = file;
  if (fileTypeWhiteList.includes(mimetype)) {
    cb(null, true);
  } else {
    cb({ message: "Invalid format. Allow only .png or .jpg" }, false);
  }
};

const upload = multer({
  storage: multerConfig,
  fileFilter,
});

module.exports = upload;
