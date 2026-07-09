const express = require("express");
const router = express.Router();

const {
    obtenerRecetas,
    crearReceta
} = require("../controllers/recetasController");

// Obtener todas las recetas
router.get("/", obtenerRecetas);

// Crear una nueva receta
router.post("/", crearReceta);

module.exports = router;