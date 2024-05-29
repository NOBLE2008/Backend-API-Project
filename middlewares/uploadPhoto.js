const multer = require('multer');

const upload = multer({dest: 'public/img/users'});

exports.photoUpload = upload.single('photo');