const express = require("express");
const router = express.Router();

const verificarToken = require("../middlewares/authMiddleware");

const {
    obtenerFavoritos,
    obtenerIdsFavoritos,
    agregarFavorito,
    eliminarFavorito
} = require("../controllers/favoritosController");

// Todas estas rutas necesitan sesión
router.get("/", verificarToken, obtenerFavoritos);
router.get("/ids", verificarToken, obtenerIdsFavoritos);
router.post("/:id", verificarToken, agregarFavorito);
router.delete("/:id", verificarToken, eliminarFavorito);

module.exports = router;