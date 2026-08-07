const pool = require("../database/connection");

// Obtener recetas favoritas del usuario
const obtenerFavoritos = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;

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
            FROM favoritos
            INNER JOIN recetas ON favoritos.id_receta = recetas.id_receta
            LEFT JOIN usuarios ON recetas.id_usuario = usuarios.id_usuario
            LEFT JOIN categorias ON recetas.id_categoria = categorias.id_categoria
            WHERE favoritos.id_usuario = $1
            ORDER BY favoritos.id_favorito DESC
        `, [id_usuario]);

        res.json(resultado.rows);
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al obtener favoritos",
            error: error.message
        });
    }
};

// Obtener solo los IDs de recetas favoritas
const obtenerIdsFavoritos = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;

        const resultado = await pool.query(
            "SELECT id_receta FROM favoritos WHERE id_usuario = $1",
            [id_usuario]
        );

        res.json(resultado.rows);
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al obtener IDs de favoritos",
            error: error.message
        });
    }
};

// Agregar receta a favoritos
const agregarFavorito = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        const { id } = req.params;

        const recetaExiste = await pool.query(
            "SELECT * FROM recetas WHERE id_receta = $1",
            [id]
        );

        if (recetaExiste.rows.length === 0) {
            return res.status(404).json({
                mensaje: "Receta no encontrada"
            });
        }

        const favoritoExiste = await pool.query(
            "SELECT * FROM favoritos WHERE id_usuario = $1 AND id_receta = $2",
            [id_usuario, id]
        );

        if (favoritoExiste.rows.length > 0) {
            return res.status(400).json({
                mensaje: "La receta ya está en favoritos"
            });
        }

        const resultado = await pool.query(
            `INSERT INTO favoritos (id_usuario, id_receta)
             VALUES ($1, $2)
             RETURNING *`,
            [id_usuario, id]
        );

        res.status(201).json({
            mensaje: "Receta agregada a favoritos",
            favorito: resultado.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al agregar favorito",
            error: error.message
        });
    }
};

// Quitar receta de favoritos
const eliminarFavorito = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        const { id } = req.params;

        const resultado = await pool.query(
            `DELETE FROM favoritos 
             WHERE id_usuario = $1 AND id_receta = $2
             RETURNING *`,
            [id_usuario, id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: "La receta no estaba en favoritos"
            });
        }

        res.json({
            mensaje: "Receta eliminada de favoritos",
            favorito: resultado.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al eliminar favorito",
            error: error.message
        });
    }
};

module.exports = {
    obtenerFavoritos,
    obtenerIdsFavoritos,
    agregarFavorito,
    eliminarFavorito
};
