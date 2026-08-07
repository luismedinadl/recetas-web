const pool = require("./connection");

const migrar = async () => {
    try {
        await pool.query("BEGIN");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id_usuario SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                correo VARCHAR(150) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS categorias (
                id_categoria SERIAL PRIMARY KEY,
                nombre_categoria VARCHAR(100) NOT NULL UNIQUE
            );

            CREATE TABLE IF NOT EXISTS recetas (
                id_receta SERIAL PRIMARY KEY,
                titulo VARCHAR(150) NOT NULL,
                descripcion TEXT,
                ingredientes TEXT NOT NULL,
                preparacion TEXT NOT NULL,
                imagen VARCHAR(500),
                tiempo_preparacion VARCHAR(50),
                id_usuario INTEGER REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
                id_categoria INTEGER REFERENCES categorias(id_categoria) ON DELETE SET NULL,
                fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS favoritos (
                id_favorito SERIAL PRIMARY KEY,
                id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
                id_receta INTEGER NOT NULL REFERENCES recetas(id_receta) ON DELETE CASCADE,
                UNIQUE (id_usuario, id_receta)
            );

            ALTER TABLE recetas
            ADD COLUMN IF NOT EXISTS imagen VARCHAR(500);
        `);

        await pool.query(`
            INSERT INTO categorias (id_categoria, nombre_categoria)
            VALUES
                (1, 'Comida mexicana'),
                (2, 'Postres'),
                (3, 'Bebidas')
            ON CONFLICT (id_categoria) DO UPDATE
            SET nombre_categoria = EXCLUDED.nombre_categoria;
        `);

        await pool.query(`
            SELECT setval(
                pg_get_serial_sequence('categorias', 'id_categoria'),
                GREATEST((SELECT COALESCE(MAX(id_categoria), 1) FROM categorias), 1)
            );
        `);

        await pool.query("COMMIT");
        console.log("Base de datos preparada correctamente");
    } catch (error) {
        await pool.query("ROLLBACK");
        console.error("Error al preparar la base de datos:", error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
};

migrar();
