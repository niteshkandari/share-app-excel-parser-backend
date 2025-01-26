import multer from "multer";
import path from "path";
import fs from "fs/promises";

console.log(__dirname, "check")
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename with timestamp
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  const ext = path.extname(file.originalname);
  if (ext !== ".xlsx" && ext !== ".xls" && ext !== ".numbers" && ext !== ".csv") {
    return cb(new Error("Only Excel, CSV, and .numbers files are allowed!"));
  }
  cb(null, true);
};

export const upload = multer({ storage, fileFilter });
