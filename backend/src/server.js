const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const pool = require("./database/connection");
const recetasRoutes = require("./routes/recetasRoutes");
const usuariosRoutes = require("./routes/usuariosRoutes");
const favoritosRoutes = require("./routes/favoritosRoutes");
const externasRoutes = require("./routes/externasRoutes");

const app = express();
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, "../uploads");
const origenesPermitidos = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || origenesPermitidos.includes(origin)) {
            return callback(null, true);
        }

        callback(new Error("Origen no permitido por CORS"));
    }
}));
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

app.get("/", (req, res) => {
    res.send("API de recetas funcionando correctamente");
});

app.get("/api/test-db", async (req, res) => {
    try {
        const resultado = await pool.query("SELECT NOW()");

        res.json({
            mensaje: "Conexión exitosa con PostgreSQL",
            fecha: resultado.rows[0].now
        });
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al conectar con PostgreSQL",
            error: error.message
        });
    }
});

app.use("/api/recetas", recetasRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/favoritos", favoritosRoutes);
app.use("/api/externas", externasRoutes);

app.use((error, req, res, next) => {
    if (error) {
        return res.status(400).json({
            mensaje: error.message || "Error al procesar el archivo"
        });
    }

    next();
});

app.get("/api/health", (req, res) => {
    res.json({ estado: "ok" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
