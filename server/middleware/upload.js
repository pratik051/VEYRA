import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.resolve("uploads/payments");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = file.fieldname + "-" + Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, cleanName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and WebP payment screenshots are allowed."), false);
  }
};

export const uploadPaymentScreenshot = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter
});

export default uploadPaymentScreenshot;
