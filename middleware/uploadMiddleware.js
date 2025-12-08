import multer from "multer";

const storage = multer.memoryStorage(); // store in memory buffer

const upload = multer({ storage });

export default upload;
