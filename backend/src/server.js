const express = require("express");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta principal
app.get("/", (req, res) => {
    res.send("API de recetas funcionando correctamente");
});

// Ruta de prueba para recetas
app.get("/api/recetas", (req, res) => {
    res.json([
        {
            id: 1,
            nombre: "Tacos de pollo",
            categoria: "Comida mexicana",
            tiempo: "30 minutos"
        },
        {
            id: 2,
            nombre: "Pastel de chocolate",
            categoria: "Postre",
            tiempo: "60 minutos"
        }
    ]);
});

// Puerto
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});