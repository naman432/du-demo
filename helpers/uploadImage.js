const multer = require("multer");

function createUserMediaPath(req, res, next) {
  next();
}
module.exports.createUserMediaPath = createUserMediaPath;

const uploadUserMedia = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `./public/Images`);
    },
    filename: function (req, file, cb) {
      console.log(file);
      let extArray = file.mimetype.split("/");
      let ext = extArray[extArray.length - 1];
      cb(null, Date.now().toString() + `.${ext}`);
    },
  }),
});

module.exports.uploadUserMedia = uploadUserMedia;
