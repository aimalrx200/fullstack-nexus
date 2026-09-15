import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
  ];

  if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file MIME type. Only JPEG, PNG, WEBP, and AVIF image formats are allowed.",
      ),
      false,
    );
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Max 5MB per upload
    files: 5, // Max 5 files per request
  },
  fileFilter,
});
