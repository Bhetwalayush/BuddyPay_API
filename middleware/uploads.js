import multer, { diskStorage } from "multer";
import { extname } from "path";
// const maxSize = 2 * 1024 * 1024; // 2MB

const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    let ext = extname(file.originalname);
    cb(null, `IMG-${Date.now()}` + ext);
  },
});

const imageFileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error("File format not supported."), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  // limits: { fileSize: maxSize },
}).single("image"); // Ensure "profilePicture" is the correct field

export default upload;
