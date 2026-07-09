const express = require("express");
const router = express.Router();

const {
    obtenerRecetas,
    obtenerRecetaPorId,
    crearReceta,
    actualizarReceta,
    eliminarReceta
} = require("../controllers/recetasController");

// Obtener todas las recetas
router.get("/", obtenerRecetas);

// Obtener una receta por ID
router.get("/:id", obtenerRecetaPorId);

// Crear una nueva receta
router.post("/", crearReceta);

// Actualizar una receta
router.put("/:id", actualizarReceta);

// Eliminar una receta
router.delete("/:id", eliminarReceta);

module.exports = router;