import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [recetas, setRecetas] = useState([]);
  const [usuario, setUsuario] = useState(null);

  const [login, setLogin] = useState({
    correo: "",
    password: "",
  });

  const [registro, setRegistro] = useState({
    nombre: "",
    correo: "",
    password: "",
  });

  const [formulario, setFormulario] = useState({
    titulo: "",
    descripcion: "",
    ingredientes: "",
    preparacion: "",
    tiempo_preparacion: "",
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

  const manejarCambioLogin = (e) => {
    setLogin({
      ...login,
      [e.target.name]: e.target.value,
    });
  };

  const manejarCambioRegistro = (e) => {
    setRegistro({
      ...registro,
      [e.target.name]: e.target.value,
    });
  };

  const manejarCambioReceta = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  };

  const registrarUsuario = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:3000/api/usuarios/registro", registro);

      alert("Usuario registrado correctamente. Ahora inicia sesión.");

      setRegistro({
        nombre: "",
        correo: "",
        password: "",
      });
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      alert(error.response?.data?.mensaje || "Error al registrar usuario");
    }
  };

  const iniciarSesion = async (e) => {
    e.preventDefault();

    try {
      const respuesta = await axios.post(
        "http://localhost:3000/api/usuarios/login",
        login
      );

      localStorage.setItem("token", respuesta.data.token);
      localStorage.setItem("usuario", JSON.stringify(respuesta.data.usuario));

      setUsuario(respuesta.data.usuario);

      setLogin({
        correo: "",
        password: "",
      });

      alert("Inicio de sesión correcto");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert(error.response?.data?.mensaje || "Error al iniciar sesión");
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
  };

  const guardarReceta = async (e) => {
    e.preventDefault();

    if (!usuario) {
      alert("Debes iniciar sesión para publicar una receta");
      return;
    }

    try {
      await axios.post("http://localhost:3000/api/recetas", {
        ...formulario,
        id_usuario: usuario.id_usuario,
        id_categoria: Number(formulario.id_categoria),
      });

      setFormulario({
        titulo: "",
        descripcion: "",
        ingredientes: "",
        preparacion: "",
        tiempo_preparacion: "",
        id_categoria: 1,
      });

      obtenerRecetas();
      alert("Receta guardada correctamente");
    } catch (error) {
      console.error("Error al guardar receta:", error);
      alert("Error al guardar receta");
    }
  };

  useEffect(() => {
    obtenerRecetas();

    const usuarioGuardado = localStorage.getItem("usuario");

    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
  }, []);

  return (
    <div>
      <nav className="navbar navbar-dark bg-dark">
        <div className="container">
          <span className="navbar-brand mb-0 h1">Recetas Web</span>

          {usuario ? (
            <div className="d-flex align-items-center">
              <span className="text-white me-3">
                Usuario: {usuario.nombre}
              </span>

              <button className="btn btn-outline-light btn-sm" onClick={cerrarSesion}>
                Cerrar sesión
              </button>
            </div>
          ) : (
            <span className="text-white">Sin sesión iniciada</span>
          )}
        </div>
      </nav>

      <div className="container mt-4">
        <h1 className="text-center mb-3">
          Aplicación Web de Recetas de Cocina
        </h1>

        <p className="text-center text-muted">
          Consulta y registra recetas publicadas por los usuarios.
        </p>

        {!usuario && (
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                  Registrar usuario
                </div>

                <div className="card-body">
                  <form onSubmit={registrarUsuario}>
                    <div className="mb-3">
                      <label className="form-label">Nombre</label>
                      <input
                        type="text"
                        className="form-control"
                        name="nombre"
                        value={registro.nombre}
                        onChange={manejarCambioRegistro}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Correo</label>
                      <input
                        type="email"
                        className="form-control"
                        name="correo"
                        value={registro.correo}
                        onChange={manejarCambioRegistro}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Contraseña</label>
                      <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={registro.password}
                        onChange={manejarCambioRegistro}
                        required
                      />
                    </div>

                    <button type="submit" className="btn btn-primary">
                      Registrarme
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card shadow-sm">
                <div className="card-header bg-success text-white">
                  Iniciar sesión
                </div>

                <div className="card-body">
                  <form onSubmit={iniciarSesion}>
                    <div className="mb-3">
                      <label className="form-label">Correo</label>
                      <input
                        type="email"
                        className="form-control"
                        name="correo"
                        value={login.correo}
                        onChange={manejarCambioLogin}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Contraseña</label>
                      <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={login.password}
                        onChange={manejarCambioLogin}
                        required
                      />
                    </div>

                    <button type="submit" className="btn btn-success">
                      Iniciar sesión
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {usuario && (
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
                    onChange={manejarCambioReceta}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Descripción</label>
                  <textarea
                    className="form-control"
                    name="descripcion"
                    value={formulario.descripcion}
                    onChange={manejarCambioReceta}
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label">Ingredientes</label>
                  <textarea
                    className="form-control"
                    name="ingredientes"
                    value={formulario.ingredientes}
                    onChange={manejarCambioReceta}
                    required
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label">Preparación</label>
                  <textarea
                    className="form-control"
                    name="preparacion"
                    value={formulario.preparacion}
                    onChange={manejarCambioReceta}
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
                    onChange={manejarCambioReceta}
                    placeholder="Ejemplo: 30 minutos"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Categoría</label>
                  <select
                    className="form-select"
                    name="id_categoria"
                    value={formulario.id_categoria}
                    onChange={manejarCambioReceta}
                  >
                    <option value="1">Comida mexicana</option>
                    <option value="2">Postres</option>
                    <option value="3">Bebidas</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-dark">
                  Guardar receta
                </button>
              </form>
            </div>
          </div>
        )}

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