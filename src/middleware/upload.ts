import multer from "multer";
import path from "path";
import fs from "fs/promises";

// Ensure the "uploads" directory exists, create it if it doesn't
const createUploadsFolder = async () => {
  try {
    // Check if the directory exists
    await fs.access("uploads"); // This will check if the directory exists
    console.log("Uploads folder already exists.");
  } catch (err:any) {
    // If the folder does not exist, create it
    if (err.code === "ENOENT") {
      await fs.mkdir("uploads", { recursive: true });
      console.log("Uploads folder created.");
    } else {
      console.error("Error checking or creating uploads folder:", err);
    }
  }
};

// Call the function to ensure the folder exists
createUploadsFolder();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // The folder where the files will be uploaded
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
