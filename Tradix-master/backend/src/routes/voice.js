import express from "express";
import multer from "multer";
import path from "path";
import { parseVoiceCommand } from "../controllers/voice.js";
import { parsePdf, importPdfTrades } from "../controllers/pdf.js";
import { verifyToken } from "../middleware/authorise.js";
import { HandleAsyncError } from "../middleware/catchError.js";

const router = express.Router();
router.use(verifyToken);

// ── Multer config for PDF uploads ──────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `pdf-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files allowed"), false);
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// ── Voice command route ────────────────────────────────────────────────────
router.post("/voice/parse", HandleAsyncError(parseVoiceCommand));

// ── PDF routes ─────────────────────────────────────────────────────────────
router.post("/voice/parse-pdf", upload.single("pdf"), HandleAsyncError(parsePdf));
router.post("/voice/import-pdf-trades", HandleAsyncError(importPdfTrades));

export default router;
