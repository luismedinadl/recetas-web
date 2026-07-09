const pool = require("../database/connection");

// Obtener todas las recetas
const obtenerRecetas = async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT 
                recetas.id_receta,
                recetas.titulo,
                recetas.descripcion,
                recetas.ingredientes,
                recetas.preparacion,
                recetas.tiempo_preparacion,
                recetas.fecha_publicacion,
                usuarios.nombre AS usuario,
                categorias.nombre_categoria AS categoria
            FROM recetas
            LEFT JOIN usuarios ON recetas.id_usuario = usuarios.id_usuario
            LEFT JOIN categorias ON recetas.id_categoria = categorias.id_categoria
            ORDER BY recetas.id_receta ASC
        `);

        res.json(resultado.rows);
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al obtener recetas",
            error: error.message
        });
    }
};

// Crear una nueva receta
const crearReceta = async (req, res) => {
    try {
        const {
            titulo,
            descripcion,
            ingredientes,
            preparacion,
            tiempo_preparacion,
            id_usuario,
            id_categoria
        } = req.body;

        if (!titulo || !ingredientes || !preparacion) {
            return res.status(400).json({
                mensaje: "El título, los ingredientes y la preparación son obligatorios"
            });
        }

        const resultado = await pool.query(
            `INSERT INTO recetas 
            (titulo, descripcion, ingredientes, preparacion, tiempo_preparacion, id_usuario, id_categoria)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [
                titulo,
                descripcion,
                ingredientes,
                preparacion,
                tiempo_preparacion,
                id_usuario,
                id_categoria
            ]
        );

        res.status(201).json({
            mensaje: "Receta creada correctamente",
            receta: resultado.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al crear receta",
            error: error.message
        });
    }
};

module.exports = {
    obtenerRecetas,
    crearReceta
};