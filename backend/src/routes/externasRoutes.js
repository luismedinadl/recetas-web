const express = require("express");
const router = express.Router();

const {
    buscarRecetasExternas
} = require("../controllers/externasController");

// Buscar recetas externas
router.get("/buscar", buscarRecetasExternas);

module.exports = router;