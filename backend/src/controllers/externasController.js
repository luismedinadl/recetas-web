const axios = require("axios");

// Buscar recetas externas usando TheMealDB
const buscarRecetasExternas = async (req, res) => {
    try {
        const { nombre } = req.query;

        if (!nombre) {
            return res.status(400).json({
                mensaje: "Debes escribir el nombre de una receta"
            });
        }

        const respuesta = await axios.get(
            `https://www.themealdb.com/api/json/v1/1/search.php?s=${nombre}`
        );

        if (!respuesta.data.meals) {
            return res.json([]);
        }

        const recetas = respuesta.data.meals.map((meal) => {
            const ingredientes = [];

            for (let indice = 1; indice <= 20; indice += 1) {
                const ingrediente = meal[`strIngredient${indice}`]?.trim();
                const medida = meal[`strMeasure${indice}`]?.trim();

                if (ingrediente) {
                    ingredientes.push(
                        medida ? `${medida} ${ingrediente}` : ingrediente
                    );
                }
            }

            return {
                id: meal.idMeal,
                nombre: meal.strMeal,
                categoria: meal.strCategory,
                area: meal.strArea,
                instrucciones: meal.strInstructions,
                ingredientes,
                imagen: meal.strMealThumb,
                fuente: "TheMealDB"
            };
        });

        res.json(recetas);

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al consultar la API externa",
            error: error.message
        });
    }
};

module.exports = {
    buscarRecetasExternas
};
