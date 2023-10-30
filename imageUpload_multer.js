const multer = require('multer');
const path = require('path');
const { imageUpload, fileLimit } = require('../constant/index');

const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    console.log('🚀 ~ file: imageUpload.js:25 ~ req:', file);
    let uploadFilePath;
    if (req.headers.type === imageUpload.PROFILE) {
      uploadFilePath = path.resolve(__dirname, '../uploads/profileImage');
    } else if (req.headers.type === imageUpload.VERIFICATION) {
      uploadFilePath = path.resolve(__dirname, '../uploads/verificationImage');
    } else if (req.headers.type === imageUpload.PROOF) {
      uploadFilePath = path.resolve(__dirname, '../uploads/proof');
    } else if (req.headers.type === imageUpload.STUDENT) {
      uploadFilePath = path.resolve(__dirname, '../uploads/student');
    } else if (req.headers.type === imageUpload.DOCS) {
      uploadFilePath = path.resolve(__dirname, '../uploads/docs');
    }
    cb(null, uploadFilePath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    console.log('🚀 ~ file: imageUpload.js:24 ~ uniqueSuffix:', uniqueSuffix);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const multerFilter = (req, file, cb) => {
  const extension = ['.png', '.jpg', '.jpeg', '.pdf', '.docs', '.*'].indexOf(path.extname(file.originalname).toLowerCase()) >= 0;
  console.log('🚀 ~ file: imageUpload.js:27 ~ multerFilter ~ extension:', extension);
  const mimeType = ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'].indexOf(file.mimetype) >= 0;
  console.log('🚀 ~ file: imageUpload.js:28 ~ multerFilter ~ mimeType:', mimeType, file.mimetype);

  if (extension && mimeType) {
    return cb(null, true);
  }
  return cb(null, false);
};

// exports.upload = multer({
//   storage,
//   fileFilter: multerFilter,
//   limits: {
//     fileSize: 1024 * 1024 * 5
//   }
// });

exports.uploadImage = (file) => async (req, res, next) => {
  const upload = multer({
    storage,
    fileFilter: multerFilter,
    limits: {
      fileSize: fileLimit.LIMIT
    }
  }).single(file);
  upload(req, res, (error) => {
    if (error) {
      error.message = 'Image Size is exceeded.';
      req.err = error;
    }
    return next();
  });
};
