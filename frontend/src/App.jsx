import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [recetas, setRecetas] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [recetaEditando, setRecetaEditando] = useState(null);
  const [favoritos, setFavoritos] = useState([]);
  const [mostrarFavoritos, setMostrarFavoritos] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [mostrarMisRecetas, setMostrarMisRecetas] = useState(false);
  const [busquedaExterna, setBusquedaExterna] = useState("");
  const [recetasExternas, setRecetasExternas] = useState([]);
  const [mostrarAuth, setMostrarAuth] = useState(false);
  const [mostrarFormularioReceta, setMostrarFormularioReceta] = useState(false);

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

  const obtenerCategoriaId = (receta) => {
    if (receta.id_categoria) {
      return receta.id_categoria;
    }

    if (receta.categoria === "Comida mexicana") {
      return 1;
    }

    if (receta.categoria === "Postres") {
      return 2;
    }

    if (receta.categoria === "Bebidas") {
      return 3;
    }

    return 1;
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
        login,
      );

      localStorage.setItem("token", respuesta.data.token);
      localStorage.setItem("usuario", JSON.stringify(respuesta.data.usuario));

      setUsuario(respuesta.data.usuario);
      setMostrarAuth(false);
      obtenerIdsFavoritos();

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
    setRecetaEditando(null);
    setFavoritos([]);
    setMostrarFavoritos(false);
    setMostrarMisRecetas(false);
    setMostrarAuth(false);

    setFormulario({
      titulo: "",
      descripcion: "",
      ingredientes: "",
      preparacion: "",
      tiempo_preparacion: "",
      id_categoria: 1,
    });
  };

  const guardarReceta = async (e) => {
    e.preventDefault();

    if (!usuario) {
      alert("Debes iniciar sesión para publicar una receta");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      if (recetaEditando) {
        await axios.put(
          `http://localhost:3000/api/recetas/${recetaEditando}`,
          {
            ...formulario,
            id_categoria: Number(formulario.id_categoria),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        alert("Receta actualizada correctamente");
        setRecetaEditando(null);
      } else {
        await axios.post(
          "http://localhost:3000/api/recetas",
          {
            ...formulario,
            id_categoria: Number(formulario.id_categoria),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        alert("Receta guardada correctamente");
      }

      setFormulario({
        titulo: "",
        descripcion: "",
        ingredientes: "",
        preparacion: "",
        tiempo_preparacion: "",
        id_categoria: 1,
      });

      setMostrarFormularioReceta(false);
      obtenerRecetas();
    } catch (error) {
      console.error("Error al guardar receta:", error);
      alert(error.response?.data?.mensaje || "Error al guardar receta");
    }
  };

  const cancelarEdicion = () => {
    setRecetaEditando(null);
    setMostrarFormularioReceta(false);

    setFormulario({
      titulo: "",
      descripcion: "",
      ingredientes: "",
      preparacion: "",
      tiempo_preparacion: "",
      id_categoria: 1,
    });
  };

  const editarReceta = (receta) => {
    setRecetaEditando(receta.id_receta);
    setMostrarFormularioReceta(true);
    setFormulario({
      titulo: receta.titulo || "",
      descripcion: receta.descripcion || "",
      ingredientes: receta.ingredientes || "",
      preparacion: receta.preparacion || "",
      tiempo_preparacion: receta.tiempo_preparacion || "",
      id_categoria: receta.id_categoria || 1,
    });
  };

  const eliminarReceta = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar esta receta?",
    );

    if (!confirmar) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      await axios.delete(`http://localhost:3000/api/recetas/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Receta eliminada correctamente");
      obtenerRecetas();
    } catch (error) {
      console.error("Error al eliminar receta:", error);
      alert(error.response?.data?.mensaje || "Error al eliminar receta");
    }
  };

  const alternarFavorito = async (id_receta) => {
    if (!usuario) {
      alert("Debes iniciar sesión para guardar favoritos");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      if (favoritos.includes(Number(id_receta))) {
        await axios.delete(`http://localhost:3000/api/favoritos/${id_receta}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        alert("Receta eliminada de favoritos");
      } else {
        await axios.post(
          `http://localhost:3000/api/favoritos/${id_receta}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        alert("Receta agregada a favoritos");
      }

      obtenerIdsFavoritos();
    } catch (error) {
      console.error("Error con favoritos:", error);
      alert(error.response?.data?.mensaje || "Error al actualizar favoritos");
    }
  };

  useEffect(() => {
    obtenerRecetas();

    const usuarioGuardado = localStorage.getItem("usuario");

    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
      obtenerIdsFavoritos();
    }
  }, []);

  const obtenerIdsFavoritos = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setFavoritos([]);
      return;
    }

    try {
      const respuesta = await axios.get(
        "http://localhost:3000/api/favoritos/ids",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const ids = respuesta.data.map((favorito) => Number(favorito.id_receta));
      setFavoritos(ids);
    } catch (error) {
      console.error("Error al obtener favoritos:", error);
    }
  };

  const recetasDelUsuario = usuario
    ? recetas.filter(
        (receta) => Number(receta.id_usuario) === Number(usuario.id_usuario),
      )
    : [];

  const recetasBase = mostrarMisRecetas
    ? recetasDelUsuario
    : mostrarFavoritos
      ? recetas.filter((receta) => favoritos.includes(Number(receta.id_receta)))
      : recetas;

  const recetasMostradas = recetasBase.filter((receta) => {
    const texto = busqueda.toLowerCase();

    const coincideBusqueda =
      receta.titulo?.toLowerCase().includes(texto) ||
      receta.descripcion?.toLowerCase().includes(texto) ||
      receta.ingredientes?.toLowerCase().includes(texto);

    const coincideCategoria =
      filtroCategoria === "todas" ||
      Number(receta.id_categoria) === Number(filtroCategoria);

    return coincideBusqueda && coincideCategoria;
  });

  const buscarRecetasExternas = async (e) => {
    e.preventDefault();

    if (!busquedaExterna.trim()) {
      alert("Escribe el nombre de una receta para buscar");
      return;
    }

    try {
      const respuesta = await axios.get(
        `http://localhost:3000/api/externas/buscar?nombre=${busquedaExterna}`,
      );

      setRecetasExternas(respuesta.data);

      if (respuesta.data.length === 0) {
        alert("No se encontraron recetas externas");
      }
    } catch (error) {
      console.error("Error al buscar recetas externas:", error);
      alert("Error al consultar la API externa");
    }
  };

  return (
    <div>
      <nav className="navbar navbar-dark app-navbar">
        <div className="container">
          <span className="navbar-brand mb-0 h1 app-title">🍽️ Recetas Web</span>

          {usuario ? (
            <div className="d-flex align-items-center">
              <span className="text-white me-3">👤 {usuario.nombre}</span>

              <button
                className="btn btn-outline-light btn-sm"
                onClick={cerrarSesion}
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <button
              className="btn btn-outline-light btn-sm"
              onClick={() => setMostrarAuth(!mostrarAuth)}
            >
              Iniciar sesión | Registrarse
            </button>
          )}
        </div>
      </nav>

      <div className="container mt-4">
        <div className="hero-section text-center">
          <h1>Recetas de Cocina</h1>

          <p>
            Comparte, consulta y guarda recetas de cocina con tu perfil de
            usuario.
          </p>

          {usuario && (
            <span className="badge bg-success">
              Sesión iniciada como {usuario.nombre}
            </span>
          )}
        </div>

        {usuario && (
          <div className="card custom-card mb-4">
            <div className="card-header bg-secondary text-white">
              Perfil de usuario
            </div>

            <div className="card-body">
              <h5>{usuario.nombre}</h5>
              <p>
                <strong>Correo:</strong> {usuario.correo}
              </p>

              <p>
                <strong>Recetas publicadas:</strong> {recetasDelUsuario.length}
              </p>

              <p>
                <strong>Recetas favoritas:</strong> {favoritos.length}
              </p>

              <button
                className="btn btn-soft me-2"
                onClick={() => {
                  setMostrarMisRecetas(!mostrarMisRecetas);
                  setMostrarFavoritos(false);
                }}
              >
                {mostrarMisRecetas
                  ? "Ver todas las recetas"
                  : "Ver mis recetas"}
              </button>

              <button
                className="btn btn-soft me-2"
                onClick={() => {
                  setMostrarFavoritos(!mostrarFavoritos);
                  setMostrarMisRecetas(false);
                }}
              >
                {mostrarFavoritos
                  ? "Ver todas las recetas"
                  : "Ver mis favoritas"}
              </button>
            </div>
          </div>
        )}

        {!usuario && mostrarAuth && (
          <div className="row mb-4">
            <div className="col-md-6 mb-3">
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

            <div className="col-md-6 mb-3">
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

        {usuario && !mostrarFormularioReceta && !recetaEditando && (
          <div className="text-end mb-3">
            <button
              className="btn btn-main"
              onClick={() => setMostrarFormularioReceta(true)}
            >
              + Agregar nueva receta
            </button>
          </div>
        )}

        {usuario && (mostrarFormularioReceta || recetaEditando) && (
          <div className="card custom-card mb-4">
            <div className="card-header bg-dark text-white">
              {recetaEditando ? "Editar receta" : "Agregar nueva receta"}
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

                <button type="submit" className="btn btn-main me-2">
                  {recetaEditando ? "Actualizar receta" : "Guardar receta"}
                </button>

                <button
  type="button"
  className="btn btn-secondary"
  onClick={cancelarEdicion}
>
  Cancelar
</button>
              </form>
            </div>
          </div>
        )}

        <div className="card custom-card mb-4">
          <div className="card-header bg-info text-white">
            Buscar recetas externas
          </div>

          <div className="card-body">
            <form onSubmit={buscarRecetasExternas} className="row">
              <div className="col-md-9 mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ejemplo: chicken, pasta, cake"
                  value={busquedaExterna}
                  onChange={(e) => setBusquedaExterna(e.target.value)}
                />
              </div>

              <div className="col-md-3 mb-2">
                <button type="submit" className="btn btn-info text-white w-100">
                  Buscar
                </button>
              </div>
            </form>

            {recetasExternas.length > 0 && (
              <div className="row mt-4">
                {recetasExternas.map((receta) => (
                  <div className="col-md-4 mb-4" key={receta.id}>
                    <div className="card h-100 recipe-card">
                      <img
                        src={receta.imagen}
                        className="card-img-top"
                        alt={receta.nombre}
                      />

                      <div className="card-body">
                        <h5 className="card-title">{receta.nombre}</h5>

                        <p>
                          <strong>Categoría:</strong> {receta.categoria}
                        </p>

                        <p>
                          <strong>Origen:</strong> {receta.area}
                        </p>

                        <p>
                          <strong>Fuente:</strong> {receta.fuente}
                        </p>

                        <p>{receta.instrucciones.substring(0, 200)}...</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <h2 className="section-title">
          {mostrarMisRecetas
            ? "Mis recetas"
            : mostrarFavoritos
              ? "Mis recetas favoritas"
              : "Recetas registradas"}
        </h2>
        <div className="row mb-3">
          <div className="col-md-8 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar receta por nombre, descripción o ingredientes..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="col-md-4 mb-2">
            <select
              className="form-select"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
            >
              <option value="todas">Todas las categorías</option>
              <option value="1">Comida mexicana</option>
              <option value="2">Postres</option>
              <option value="3">Bebidas</option>
            </select>
          </div>
        </div>

        <div className="row">
          {recetasMostradas.length === 0 ? (
            <div className="col-12">
              <div className="alert alert-warning text-center">
                No hay recetas registradas.
              </div>
            </div>
          ) : (
            recetasMostradas.map((receta) => (
              <div className="col-md-4 mb-4" key={receta.id_receta}>
                <div className="card h-100 recipe-card">
                  <div className="card-body">
                    <h5 className="card-title">{receta.titulo}</h5>

                    <span className="recipe-category">
                      {receta.categoria || "Sin categoría"}
                    </span>

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

                    {/* Botón de favoritos: aparece para cualquier usuario con sesión */}
                    {usuario && (
                      <button
                        className={
                          favoritos.includes(Number(receta.id_receta))
                            ? "btn btn-outline-danger btn-sm mt-2 me-2"
                            : "btn btn-outline-primary btn-sm mt-2 me-2"
                        }
                        onClick={() => alternarFavorito(receta.id_receta)}
                      >
                        {favoritos.includes(Number(receta.id_receta))
                          ? "Quitar de favoritos"
                          : "Guardar en favoritos"}
                      </button>
                    )}

                    {usuario &&
                      Number(usuario.id_usuario) ===
                        Number(receta.id_usuario) && (
                        <div className="d-flex gap-2 mt-3">
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => editarReceta(receta)}
                          >
                            Editar
                          </button>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => eliminarReceta(receta.id_receta)}
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
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
