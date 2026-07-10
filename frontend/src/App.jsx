import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [recetas, setRecetas] = useState([]);

  const obtenerRecetas = async () => {
    try {
      const respuesta = await axios.get("http://localhost:3000/api/recetas");
      setRecetas(respuesta.data);
    } catch (error) {
      console.error("Error al obtener recetas:", error);
    }
  };

  useEffect(() => {
    obtenerRecetas();
  }, []);

  return (
    <div>
      <nav className="navbar navbar-dark bg-dark">
        <div className="container">
          <span className="navbar-brand mb-0 h1">Recetas Web</span>
        </div>
      </nav>

      <div className="container mt-4">
        <h1 className="text-center mb-3">
          Aplicación Web de Recetas de Cocina
        </h1>

        <p className="text-center text-muted">
          Consulta recetas publicadas por los usuarios.
        </p>

        <div className="row mt-4">
          {recetas.length === 0 ? (
            <div className="col-12">
              <div className="alert alert-warning text-center">
                No hay recetas registradas.
              </div>
            </div>
          ) : (
            recetas.map((receta) => (
              <div className="col-md-4 mb-4" key={receta.id_receta}>
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">{receta.titulo}</h5>

                    <h6 className="card-subtitle mb-2 text-muted">
                      {receta.categoria || "Sin categoría"}
                    </h6>

                    <p className="card-text">{receta.descripcion}</p>

                    <p>
                      <strong>Ingredientes:</strong>
                      <br />
                      {receta.ingredientes}
                    </p>

                    <p>
                      <strong>Preparación:</strong>
                      <br />
                      {receta.preparacion}
                    </p>

                    <p>
                      <strong>Tiempo:</strong> {receta.tiempo_preparacion}
                    </p>

                    <p>
                      <strong>Usuario:</strong>{" "}
                      {receta.usuario || "Usuario desconocido"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;