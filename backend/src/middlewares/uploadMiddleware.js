const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, "../../uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const nombreUnico = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
        cb(null, nombreUnico);
    }
});

const subirImagen = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const tiposPermitidos = ["image/jpeg", "image/png", "image/webp", "image/gif"];

        if (!tiposPermitidos.includes(file.mimetype)) {
            return cb(new Error("Solo se permiten imágenes JPG, PNG, WEBP o GIF"));
        }

        cb(null, true);
    }
});

module.exports = subirImagen;
