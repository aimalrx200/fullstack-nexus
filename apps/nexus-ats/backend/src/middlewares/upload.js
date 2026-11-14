import multer from "multer";

const storage = multer.memoryStorage();

// Accept PDF and Word documents up to 10MB
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file format. Only PDF, DOC, and DOCX documents are supported.",
      ),
      false,
    );
  }
};

export const uploadCV = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});
