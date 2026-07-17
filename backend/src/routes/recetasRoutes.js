const express = require("express");
const router = express.Router();

const verificarToken = require("../middlewares/authMiddleware");

const {
    obtenerRecetas,
    obtenerRecetaPorId,
    crearReceta,
    actualizarReceta,
    eliminarReceta
} = require("../controllers/recetasController");

// Rutas públicas
router.get("/", obtenerRecetas);
router.get("/:id", obtenerRecetaPorId);

// Rutas protegidas
router.post("/", verificarToken, crearReceta);
router.put("/:id", verificarToken, actualizarReceta);
router.delete("/:id", verificarToken, eliminarReceta);

module.exports = router;