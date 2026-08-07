const multer = require("multer");

const subirImagen = multer({
    storage: multer.memoryStorage(),
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
