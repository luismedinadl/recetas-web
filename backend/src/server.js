const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./database/connection");
const recetasRoutes = require("./routes/recetasRoutes");

const app = express();

app.use(cors());
app.use(express.json());

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});