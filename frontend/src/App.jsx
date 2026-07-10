import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [recetas, setRecetas] = useState([]);

  const [formulario, setFormulario] = useState({
    titulo: "",
    descripcion: "",
    ingredientes: "",
    preparacion: "",
    tiempo_preparacion: "",
    id_usuario: 1,
    id_categoria: 1,
  });

  const obtenerRecetas = async () => {
    try {
      const respuesta = await axios.get("http://localhost:3000/api/recetas");
      setRecetas(respuesta.data);
    } catch (error) {
      console.error("Error al obtener recetas:", error);
    }
  };

  const manejarCambio = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  };

  const guardarReceta = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:3000/api/recetas", formulario);

      setFormulario({
        titulo: "",
        descripcion: "",
        ingredientes: "",
        preparacion: "",
        tiempo_preparacion: "",
        id_usuario: 1,
        id_categoria: 1,
      });

      obtenerRecetas();
      alert("Receta guardada correctamente");
    } catch (error) {
      console.error("Error al guardar receta:", error);
      alert("Error al guardar la receta");
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
          Consulta y registra recetas publicadas por los usuarios.
        </p>

        <div className="card shadow-sm mb-4">
          <div className="card-header bg-dark text-white">
            Agregar nueva receta
          </div>

          <div className="card-body">
            <form onSubmit={guardarReceta}>
              <div className="mb-3">
                <label className="form-label">Título</label>
                <input
                  type="text"
                  className="form-control"
                  name="titulo"
                  value={formulario.titulo}
                  onChange={manejarCambio}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-control"
                  name="descripcion"
                  value={formulario.descripcion}
                  onChange={manejarCambio}
                ></textarea>
              </div>

              <div className="mb-3">
                <label className="form-label">Ingredientes</label>
                <textarea
                  className="form-control"
                  name="ingredientes"
                  value={formulario.ingredientes}
                  onChange={manejarCambio}
                  required
                ></textarea>
              </div>

              <div className="mb-3">
                <label className="form-label">Preparación</label>
                <textarea
                  className="form-control"
                  name="preparacion"
                  value={formulario.preparacion}
                  onChange={manejarCambio}
                  required
                ></textarea>
              </div>

              <div className="mb-3">
                <label className="form-label">Tiempo de preparación</label>
                <input
                  type="text"
                  className="form-control"
                  name="tiempo_preparacion"
                  value={formulario.tiempo_preparacion}
                  onChange={manejarCambio}
                  placeholder="Ejemplo: 30 minutos"
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Guardar receta
              </button>
            </form>
          </div>
        </div>

        <h2 className="mb-3">Recetas registradas</h2>

        <div className="row">
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

                    <p>{receta.descripcion}</p>

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