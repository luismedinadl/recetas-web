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
                recetas.imagen,
                recetas.fecha_publicacion,
                recetas.id_usuario,
                recetas.id_categoria,
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

// Obtener una receta por ID
const obtenerRecetaPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            "SELECT * FROM recetas WHERE id_receta = $1",
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: "Receta no encontrada"
            });
        }

        res.json(resultado.rows[0]);

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al obtener la receta",
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
            id_categoria
        } = req.body;

        const id_usuario = req.usuario.id_usuario;
        const imagen = req.file ? `/uploads/${req.file.filename}` : null;

        if (!titulo || !ingredientes || !preparacion) {
            return res.status(400).json({
                mensaje: "El título, los ingredientes y la preparación son obligatorios"
            });
        }

        const resultado = await pool.query(
            `INSERT INTO recetas 
            (titulo, descripcion, ingredientes, preparacion, tiempo_preparacion, id_usuario, id_categoria, imagen)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [
                titulo,
                descripcion,
                ingredientes,
                preparacion,
                tiempo_preparacion,
                id_usuario,
                id_categoria,
                imagen
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

// Actualizar una receta solo si pertenece al usuario
const actualizarReceta = async (req, res) => {
    try {
        const { id } = req.params;
        const id_usuario = req.usuario.id_usuario;

        const {
            titulo,
            descripcion,
            ingredientes,
            preparacion,
            tiempo_preparacion,
            id_categoria
        } = req.body;
        const imagen = req.file ? `/uploads/${req.file.filename}` : null;

        const resultado = await pool.query(
            `UPDATE recetas 
             SET titulo = $1,
                 descripcion = $2,
                 ingredientes = $3,
                 preparacion = $4,
                 tiempo_preparacion = $5,
                 id_categoria = $6,
                 imagen = COALESCE($7, imagen)
             WHERE id_receta = $8 AND id_usuario = $9
             RETURNING *`,
            [
                titulo,
                descripcion,
                ingredientes,
                preparacion,
                tiempo_preparacion,
                id_categoria,
                imagen,
                id,
                id_usuario
            ]
        );

        if (resultado.rows.length === 0) {
            return res.status(403).json({
                mensaje: "No tienes permiso para editar esta receta"
            });
        }

        res.json({
            mensaje: "Receta actualizada correctamente",
            receta: resultado.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al actualizar receta",
            error: error.message
        });
    }
};

// Eliminar una receta solo si pertenece al usuario
const eliminarReceta = async (req, res) => {
    try {
        const { id } = req.params;
        const id_usuario = req.usuario.id_usuario;

        const resultado = await pool.query(
            "DELETE FROM recetas WHERE id_receta = $1 AND id_usuario = $2 RETURNING *",
            [id, id_usuario]
        );

        if (resultado.rows.length === 0) {
            return res.status(403).json({
                mensaje: "No tienes permiso para eliminar esta receta"
            });
        }

        res.json({
            mensaje: "Receta eliminada correctamente",
            receta: resultado.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al eliminar receta",
            error: error.message
        });
    }
};

module.exports = {
    obtenerRecetas,
    obtenerRecetaPorId,
    crearReceta,
    actualizarReceta,
    eliminarReceta
};
