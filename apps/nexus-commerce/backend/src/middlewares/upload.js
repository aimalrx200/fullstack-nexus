// apps/nexus-commerce/backend/src/middlewares/upload.js (updated to export videoUpload)

import multer from "multer";

const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  const allowedImageMimes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
  ];

  if (allowedImageMimes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file format. Only JPEG, PNG, WEBP, and AVIF image formats are allowed.",
      ),
      false,
    );
  }
};

const videoFilter = (req, file, cb) => {
  const allowedVideoMimes = [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-matroska",
  ];

  if (allowedVideoMimes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid video format. Only MP4, WebM, and QuickTime videos are allowed.",
      ),
      false,
    );
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for images
    files: 5,
  },
  fileFilter: imageFilter,
});

export const videoUpload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for showcase videos
    files: 1,
  },
  fileFilter: videoFilter,
});
