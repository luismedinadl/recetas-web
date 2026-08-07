const express = require("express");
const router = express.Router();

const {
    obtenerUsuarios,
    registrarUsuario,
    loginUsuario
} = require("../controllers/usuariosController");

// Obtener usuarios
router.get("/", obtenerUsuarios);

// Registrar usuario
router.post("/registro", registrarUsuario);

// Iniciar sesión
router.post("/login", loginUsuario);

module.exports = router;