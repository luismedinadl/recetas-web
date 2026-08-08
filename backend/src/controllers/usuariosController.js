const pool = require("../database/connection");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const validarPassword = (password) => {
    if (typeof password !== "string" || password.length < 8 || password.length > 72) {
        return "La contraseña debe tener entre 8 y 72 caracteres";
    }

    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
        return "La contraseña debe incluir una mayúscula, una minúscula y un número";
    }

    return null;
};

// Obtener usuarios
const obtenerUsuarios = async (req, res) => {
    try {
        const resultado = await pool.query(
            "SELECT id_usuario, nombre, correo, fecha_registro FROM usuarios ORDER BY id_usuario ASC"
        );

        res.json(resultado.rows);
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al obtener usuarios",
            error: error.message
        });
    }
};

// Registrar usuario
const registrarUsuario = async (req, res) => {
    try {
        const { nombre, correo, password } = req.body;

        if (!nombre || !correo || !password) {
            return res.status(400).json({
                mensaje: "Nombre, correo y contraseña son obligatorios"
            });
        }

        const errorPassword = validarPassword(password);
        if (errorPassword) {
            return res.status(400).json({ mensaje: errorPassword });
        }

        const usuarioExiste = await pool.query(
            "SELECT * FROM usuarios WHERE correo = $1",
            [correo]
        );

        if (usuarioExiste.rows.length > 0) {
            return res.status(400).json({
                mensaje: "El correo ya está registrado"
            });
        }

        const passwordEncriptado = await bcrypt.hash(password, 10);

        const resultado = await pool.query(
            `INSERT INTO usuarios (nombre, correo, password)
             VALUES ($1, $2, $3)
             RETURNING id_usuario, nombre, correo, fecha_registro`,
            [nombre, correo, passwordEncriptado]
        );

        res.status(201).json({
            mensaje: "Usuario registrado correctamente",
            usuario: resultado.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al registrar usuario",
            error: error.message
        });
    }
};

// Login de usuario
const loginUsuario = async (req, res) => {
    try {
        const { correo, password } = req.body;

        if (!correo || !password) {
            return res.status(400).json({
                mensaje: "Correo y contraseña son obligatorios"
            });
        }

        const resultado = await pool.query(
            "SELECT * FROM usuarios WHERE correo = $1",
            [correo]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: "Usuario no encontrado"
            });
        }

        const usuario = resultado.rows[0];

        const passwordValido = await bcrypt.compare(password, usuario.password);

        if (!passwordValido) {
            return res.status(401).json({
                mensaje: "Contraseña incorrecta"
            });
        }

        const token = jwt.sign(
            {
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre,
                correo: usuario.correo
            },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.json({
            mensaje: "Inicio de sesión correcto",
            token,
            usuario: {
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre,
                correo: usuario.correo
            }
        });

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al iniciar sesión",
            error: error.message
        });
    }
};

module.exports = {
    obtenerUsuarios,
    registrarUsuario,
    loginUsuario
};
