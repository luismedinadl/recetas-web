const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
    secure: true,
    hide_sensitive: true
});

const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, "../../uploads");

const subirACloudinary = (archivo) => new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
        {
            folder: "recetas-web",
            resource_type: "image"
        },
        (error, resultado) => {
            if (error) {
                return reject(error);
            }

            resolve({
                url: resultado.secure_url,
                publicId: resultado.public_id
            });
        }
    );

    stream.end(archivo.buffer);
});

const guardarLocalmente = async (archivo) => {
    await fs.mkdir(uploadsDir, { recursive: true });

    const extension = path.extname(archivo.originalname).toLowerCase();
    const nombre = `${Date.now()}-${crypto.randomUUID()}${extension}`;
    await fs.writeFile(path.join(uploadsDir, nombre), archivo.buffer);

    return {
        url: `/uploads/${nombre}`,
        publicId: null
    };
};

const guardarImagen = async (archivo) => {
    if (!archivo) {
        return null;
    }

    if (process.env.CLOUDINARY_URL) {
        return subirACloudinary(archivo);
    }

    return guardarLocalmente(archivo);
};

const eliminarImagen = async ({ publicId, url }) => {
    if (publicId && process.env.CLOUDINARY_URL) {
        await cloudinary.uploader.destroy(publicId, { invalidate: true });
        return;
    }

    if (url?.startsWith("/uploads/")) {
        const nombre = path.basename(url);
        await fs.unlink(path.join(uploadsDir, nombre)).catch(() => undefined);
    }
};

module.exports = {
    guardarImagen,
    eliminarImagen
};
