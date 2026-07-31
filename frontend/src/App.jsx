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
  const [imagen, setImagen] = useState(null);
  const [imagenActual, setImagenActual] = useState("");
  const [recetaSeleccionada, setRecetaSeleccionada] = useState(null);
  const [pestanaAuth, setPestanaAuth] = useState("login");
  const [notificacion, setNotificacion] = useState(null);
  const [procesandoAuth, setProcesandoAuth] = useState(false);
  const [guardandoReceta, setGuardandoReceta] = useState(false);

  const API_URL = "http://localhost:3000";

  const mostrarNotificacion = (mensaje, tipo = "success") => {
    setNotificacion({ mensaje, tipo, id: Date.now() });
  };

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
    setProcesandoAuth(true);

    try {
      await axios.post("http://localhost:3000/api/usuarios/registro", registro);

      mostrarNotificacion(
        "Cuenta creada correctamente. Ya puedes iniciar sesión.",
      );
      setPestanaAuth("login");

      setRegistro({
        nombre: "",
        correo: "",
        password: "",
      });
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      mostrarNotificacion(
        error.response?.data?.mensaje || "No fue posible crear la cuenta",
        "error",
      );
    } finally {
      setProcesandoAuth(false);
    }
  };

  const iniciarSesion = async (e) => {
    e.preventDefault();
    setProcesandoAuth(true);

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

      mostrarNotificacion(`Bienvenido, ${respuesta.data.usuario.nombre}`);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      mostrarNotificacion(
        error.response?.data?.mensaje || "No fue posible iniciar sesión",
        "error",
      );
    } finally {
      setProcesandoAuth(false);
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
      mostrarNotificacion("Inicia sesión para publicar una receta", "info");
      setMostrarAuth(true);
      return;
    }

    const token = localStorage.getItem("token");
    const datosReceta = new FormData();

    Object.entries(formulario).forEach(([campo, valor]) => {
      datosReceta.append(campo, valor);
    });

    if (imagen) {
      datosReceta.append("imagen", imagen);
    }

    setGuardandoReceta(true);

    try {
      if (recetaEditando) {
        await axios.put(
          `http://localhost:3000/api/recetas/${recetaEditando}`,
          datosReceta,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        mostrarNotificacion("La receta se actualizó correctamente");
        setRecetaEditando(null);
      } else {
        await axios.post(
          "http://localhost:3000/api/recetas",
          datosReceta,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        mostrarNotificacion("Tu receta se publicó correctamente");
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
      setImagen(null);
      setImagenActual("");
      obtenerRecetas();
    } catch (error) {
      console.error("Error al guardar receta:", error);
      mostrarNotificacion(
        error.response?.data?.mensaje || "No fue posible guardar la receta",
        "error",
      );
    } finally {
      setGuardandoReceta(false);
    }
  };

  const cancelarEdicion = () => {
    setRecetaEditando(null);
    setMostrarFormularioReceta(false);
    setImagen(null);
    setImagenActual("");

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
    setImagen(null);
    setImagenActual(receta.imagen || "");
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

      mostrarNotificacion("La receta se eliminó correctamente");
      obtenerRecetas();
    } catch (error) {
      console.error("Error al eliminar receta:", error);
      mostrarNotificacion(
        error.response?.data?.mensaje || "No fue posible eliminar la receta",
        "error",
      );
    }
  };

  const alternarFavorito = async (id_receta) => {
    if (!usuario) {
      mostrarNotificacion("Inicia sesión para guardar favoritos", "info");
      setMostrarAuth(true);
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

        mostrarNotificacion("Receta eliminada de favoritos", "info");
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

        mostrarNotificacion("Receta guardada en favoritos");
      }

      obtenerIdsFavoritos();
    } catch (error) {
      console.error("Error con favoritos:", error);
      mostrarNotificacion(
        error.response?.data?.mensaje || "No fue posible actualizar favoritos",
        "error",
      );
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

  useEffect(() => {
    if (!recetaSeleccionada) {
      return undefined;
    }

    const cerrarConEscape = (event) => {
      if (event.key === "Escape") {
        setRecetaSeleccionada(null);
      }
    };

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", cerrarConEscape);

    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, [recetaSeleccionada]);

  useEffect(() => {
    if (!notificacion) {
      return undefined;
    }

    const temporizador = window.setTimeout(() => {
      setNotificacion(null);
    }, 3800);

    return () => window.clearTimeout(temporizador);
  }, [notificacion]);

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

  const recetaDestacada = recetas.find((receta) => receta.imagen);
  const categoriasDisponibles = new Set(
    recetas.map((receta) => receta.id_categoria).filter(Boolean),
  ).size;

  const buscarRecetasExternas = async (e) => {
    e.preventDefault();

    if (!busquedaExterna.trim()) {
      mostrarNotificacion(
        "Escribe el nombre de una receta para buscar",
        "info",
      );
      return;
    }

    try {
      const respuesta = await axios.get(
        `http://localhost:3000/api/externas/buscar?nombre=${busquedaExterna}`,
      );

      setRecetasExternas(respuesta.data);

      if (respuesta.data.length === 0) {
        mostrarNotificacion("No se encontraron recetas externas", "info");
      }
    } catch (error) {
      console.error("Error al buscar recetas externas:", error);
      mostrarNotificacion("Error al consultar la API externa", "error");
    }
  };

  return (
    <div>
      <nav className="app-navbar">
        <div className="container navbar-content">
          <a className="brand" href="#inicio" aria-label="Ir al inicio">
            <span className="brand-icon" aria-hidden="true">R</span>
            <span>
              <strong>Recetas</strong>
              <small>Sabores para compartir</small>
            </span>
          </a>

          <div className="nav-links" aria-label="Navegación principal">
            <a href="#inicio">Inicio</a>
            <a href="#recetas">Explorar</a>
            <a href="#explorar-externas">Inspiración</a>
            {usuario && (
              <button
                type="button"
                onClick={() => {
                  setMostrarMisRecetas(true);
                  setMostrarFavoritos(false);
                  document
                    .getElementById("recetas")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Mis recetas
              </button>
            )}
          </div>

          <div className="navbar-actions">
            {usuario ? (
              <>
                <div className="user-summary">
                  <span className="user-avatar" aria-hidden="true">
                    {usuario.nombre?.charAt(0).toUpperCase()}
                  </span>
                  <span className="user-name">{usuario.nombre}</span>
                </div>
                <button
                  className="nav-publish-button"
                  onClick={() => {
                    setRecetaEditando(null);
                    setMostrarFormularioReceta(true);
                  }}
                >
                  <span aria-hidden="true">＋</span> Publicar
                </button>
                <button
                  className="nav-logout-button"
                  onClick={cerrarSesion}
                  aria-label="Cerrar sesión"
                  title="Cerrar sesión"
                >
                  Salir
                </button>
              </>
            ) : (
              <button
                className="nav-login-button"
                onClick={() => setMostrarAuth(!mostrarAuth)}
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="container">
        <section className="hero-section" id="inicio">
          <div className="hero-content">
            <span className="hero-eyebrow">Cocina, descubre y comparte</span>
            <h1>Sabores que convierten cada comida en un momento especial</h1>
            <p>
              Encuentra recetas para todos los días, guarda tus favoritas y
              comparte con la comunidad esos platillos que siempre funcionan.
            </p>

            <div className="hero-search">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="¿Qué te gustaría cocinar hoy?"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                aria-label="Buscar recetas"
              />
              <a href="#recetas">Buscar recetas</a>
            </div>

            <div className="hero-stats" aria-label="Estadísticas de la comunidad">
              <div>
                <strong>{recetas.length}</strong>
                <span>recetas publicadas</span>
              </div>
              <div>
                <strong>{categoriasDisponibles}</strong>
                <span>categorías para explorar</span>
              </div>
              <div>
                <strong>100%</strong>
                <span>hechas para compartir</span>
              </div>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            {recetaDestacada ? (
              <img
                src={`${API_URL}${recetaDestacada.imagen}`}
                alt=""
              />
            ) : (
              <div className="hero-placeholder">
                <span>🍲</span>
              </div>
            )}
            <div className="hero-visual-overlay"></div>
            <div className="hero-feature-card">
              <span>Receta destacada</span>
              <strong>
                {recetaDestacada?.titulo || "Tu próxima receta favorita"}
              </strong>
              <small>
                {recetaDestacada?.categoria || "Descubre nuevos sabores"}
              </small>
            </div>
          </div>
        </section>

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
          <div
            className="auth-backdrop"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setMostrarAuth(false);
              }
            }}
          >
            <section
              className="auth-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="auth-title"
            >
              <button
                className="auth-close"
                onClick={() => setMostrarAuth(false)}
                aria-label="Cerrar"
              >
                ×
              </button>

              <div className="auth-intro">
                <span className="brand-icon" aria-hidden="true">R</span>
                <span className="section-eyebrow">Bienvenido a Recetas</span>
                <h2 id="auth-title">
                  {pestanaAuth === "login"
                    ? "Qué gusto verte de nuevo"
                    : "Crea tu perfil de cocina"}
                </h2>
                <p>
                  {pestanaAuth === "login"
                    ? "Entra para publicar recetas y guardar tus favoritas."
                    : "Únete para compartir tus mejores sabores con la comunidad."}
                </p>
              </div>

              <div className="auth-tabs" role="tablist">
                <button
                  className={pestanaAuth === "login" ? "active" : ""}
                  onClick={() => setPestanaAuth("login")}
                  role="tab"
                  aria-selected={pestanaAuth === "login"}
                >
                  Iniciar sesión
                </button>
                <button
                  className={pestanaAuth === "registro" ? "active" : ""}
                  onClick={() => setPestanaAuth("registro")}
                  role="tab"
                  aria-selected={pestanaAuth === "registro"}
                >
                  Crear cuenta
                </button>
              </div>

              {pestanaAuth === "registro" ? (
                <form className="auth-form" onSubmit={registrarUsuario}>
                  <div className="form-field">
                    <label htmlFor="registro-nombre">Nombre</label>
                      <input
                        id="registro-nombre"
                        type="text"
                        name="nombre"
                        value={registro.nombre}
                        onChange={manejarCambioRegistro}
                        placeholder="Tu nombre"
                        autoComplete="name"
                        required
                      />
                  </div>
                  <div className="form-field">
                    <label htmlFor="registro-correo">Correo electrónico</label>
                      <input
                        id="registro-correo"
                        type="email"
                        name="correo"
                        value={registro.correo}
                        onChange={manejarCambioRegistro}
                        placeholder="nombre@ejemplo.com"
                        autoComplete="email"
                        required
                      />
                  </div>
                  <div className="form-field">
                    <label htmlFor="registro-password">Contraseña</label>
                      <input
                        id="registro-password"
                        type="password"
                        name="password"
                        value={registro.password}
                        onChange={manejarCambioRegistro}
                        placeholder="Crea una contraseña segura"
                        autoComplete="new-password"
                        required
                      />
                    <small>Usa al menos 8 caracteres para mayor seguridad.</small>
                  </div>
                  <button
                    type="submit"
                    className="auth-submit"
                    disabled={procesandoAuth}
                  >
                    {procesandoAuth ? "Creando cuenta..." : "Crear mi cuenta"}
                  </button>
                </form>
              ) : (
                <form className="auth-form" onSubmit={iniciarSesion}>
                  <div className="form-field">
                    <label htmlFor="login-correo">Correo electrónico</label>
                      <input
                        id="login-correo"
                        type="email"
                        name="correo"
                        value={login.correo}
                        onChange={manejarCambioLogin}
                        placeholder="nombre@ejemplo.com"
                        autoComplete="email"
                        required
                      />
                  </div>
                  <div className="form-field">
                    <label htmlFor="login-password">Contraseña</label>
                      <input
                        id="login-password"
                        type="password"
                        name="password"
                        value={login.password}
                        onChange={manejarCambioLogin}
                        placeholder="Tu contraseña"
                        autoComplete="current-password"
                        required
                      />
                  </div>
                  <button
                    type="submit"
                    className="auth-submit"
                    disabled={procesandoAuth}
                  >
                    {procesandoAuth ? "Ingresando..." : "Entrar a mi cuenta"}
                  </button>
                </form>
              )}
            </section>
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
          <div className="recipe-editor mb-4">
            <div className="recipe-editor-header">
              <div>
                <span className="section-eyebrow">
                  {recetaEditando ? "Actualiza tu creación" : "Comparte tu sabor"}
                </span>
                <h2>
                  {recetaEditando ? "Editar receta" : "Publicar una nueva receta"}
                </h2>
                <p>
                  Completa la información para que otros puedan prepararla en casa.
                </p>
              </div>
              <span className="recipe-editor-step">Receta</span>
            </div>

            <div className="recipe-editor-body">
              <form className="recipe-editor-form" onSubmit={guardarReceta}>
                <div className="mb-3">
                  <label className="form-label" htmlFor="receta-titulo">Título</label>
                  <input
                    id="receta-titulo"
                    type="text"
                    className="form-control"
                    name="titulo"
                    value={formulario.titulo}
                    onChange={manejarCambioReceta}
                    placeholder="Ejemplo: Enchiladas de la abuela"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="receta-descripcion">Descripción breve</label>
                  <textarea
                    id="receta-descripcion"
                    className="form-control"
                    name="descripcion"
                    value={formulario.descripcion}
                    onChange={manejarCambioReceta}
                    placeholder="Cuenta brevemente qué hace especial esta receta"
                    rows="3"
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="receta-ingredientes">Ingredientes</label>
                  <textarea
                    id="receta-ingredientes"
                    className="form-control"
                    name="ingredientes"
                    value={formulario.ingredientes}
                    onChange={manejarCambioReceta}
                    placeholder={"Escribe un ingrediente por línea\n2 tomates\n1 cebolla"}
                    rows="7"
                    required
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="receta-preparacion">Preparación</label>
                  <textarea
                    id="receta-preparacion"
                    className="form-control"
                    name="preparacion"
                    value={formulario.preparacion}
                    onChange={manejarCambioReceta}
                    placeholder="Describe los pasos de preparación en orden"
                    rows="7"
                    required
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="receta-tiempo">Tiempo de preparación</label>
                  <input
                    id="receta-tiempo"
                    type="text"
                    className="form-control"
                    name="tiempo_preparacion"
                    value={formulario.tiempo_preparacion}
                    onChange={manejarCambioReceta}
                    placeholder="Ejemplo: 30 minutos"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="receta-categoria">Categoría</label>
                  <select
                    id="receta-categoria"
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

                <div className="mb-3 recipe-image-field">
                  <label className="form-label" htmlFor="receta-imagen">Fotografía de la receta</label>
                  <label className="recipe-upload-zone" htmlFor="receta-imagen">
                    <span className="recipe-upload-icon" aria-hidden="true">＋</span>
                    <strong>
                      {imagen ? imagen.name : "Selecciona una imagen del dispositivo"}
                    </strong>
                    <small>JPG, PNG, WEBP o GIF · máximo 5 MB</small>
                  </label>
                  <input
                    id="receta-imagen"
                    type="file"
                    className="recipe-file-input"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => setImagen(e.target.files[0] || null)}
                  />
                  <div className="form-text">
                    {recetaEditando && " Si no eliges otra imagen, se conservará la actual."}
                  </div>

                  {(imagen || imagenActual) && (
                    <img
                      src={
                        imagen
                          ? URL.createObjectURL(imagen)
                          : `${API_URL}${imagenActual}`
                      }
                      className="recipe-image-preview mt-3"
                      alt="Vista previa de la receta"
                    />
                  )}
                </div>

                <div className="recipe-editor-actions">
                  <button
                    type="button"
                    className="recipe-editor-cancel"
                    onClick={cancelarEdicion}
                    disabled={guardandoReceta}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="recipe-editor-submit"
                    disabled={guardandoReceta}
                  >
                    {guardandoReceta
                      ? "Guardando..."
                      : recetaEditando
                        ? "Actualizar receta"
                        : "Publicar receta"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="card custom-card mb-4" id="explorar-externas">
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
                    <article className="recipe-card external-recipe-card h-100">
                      <div className="recipe-card-media">
                        <img src={receta.imagen} alt={receta.nombre} />
                        <span className="recipe-category">
                          {receta.categoria}
                        </span>
                      </div>

                      <div className="recipe-card-content">
                        <div className="recipe-card-kicker">
                          <span>Inspiración internacional</span>
                          <span>{receta.area}</span>
                        </div>
                        <h3>{receta.nombre}</h3>
                        <p className="recipe-card-description">
                          {receta.instrucciones}
                        </p>
                        <div className="recipe-card-footer">
                          <div className="recipe-author">
                            <span className="recipe-author-avatar">T</span>
                            <div>
                              <small>Fuente</small>
                              <strong>{receta.fuente}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="recipes-heading" id="recetas">
          <div>
            <span className="section-eyebrow">Sabores de la comunidad</span>
            <h2 className="section-title">
              {mostrarMisRecetas
                ? "Mis recetas"
                : mostrarFavoritos
                  ? "Mis recetas favoritas"
                  : "Recetas para inspirarte"}
            </h2>
          </div>
          <span className="recipes-count">
            {recetasMostradas.length}{" "}
            {recetasMostradas.length === 1 ? "receta" : "recetas"}
          </span>
        </div>
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
                <article className="recipe-card h-100">
                  <div className="recipe-card-media">
                    {receta.imagen ? (
                      <img
                        src={`${API_URL}${receta.imagen}`}
                        alt={receta.titulo}
                      />
                    ) : (
                      <div className="recipe-image-fallback" aria-hidden="true">
                        <span>🍽️</span>
                      </div>
                    )}
                    <span className="recipe-category">
                      {receta.categoria || "Sin categoría"}
                    </span>
                    {usuario && (
                      <button
                        className={`recipe-favorite-button ${
                          favoritos.includes(Number(receta.id_receta))
                            ? "is-favorite"
                            : ""
                        }`}
                        onClick={() => alternarFavorito(receta.id_receta)}
                        aria-label={
                          favoritos.includes(Number(receta.id_receta))
                            ? "Quitar de favoritos"
                            : "Guardar en favoritos"
                        }
                        title={
                          favoritos.includes(Number(receta.id_receta))
                            ? "Quitar de favoritos"
                            : "Guardar en favoritos"
                        }
                      >
                        {favoritos.includes(Number(receta.id_receta))
                          ? "♥"
                          : "♡"}
                      </button>
                    )}
                  </div>

                  <div className="recipe-card-content">
                    <div className="recipe-card-kicker">
                      <span>Receta casera</span>
                      <span>◷ {receta.tiempo_preparacion || "Sin tiempo"}</span>
                    </div>
                    <h3>{receta.titulo}</h3>
                    <p className="recipe-card-description">
                      {receta.descripcion ||
                        "Una receta compartida por nuestra comunidad para disfrutar en casa."}
                    </p>
                    <button
                      className="recipe-view-button"
                      onClick={() => setRecetaSeleccionada(receta)}
                    >
                      Ver receta completa <span aria-hidden="true">→</span>
                    </button>

                    <div className="recipe-card-footer">
                      <div className="recipe-author">
                        <span className="recipe-author-avatar">
                          {(receta.usuario || "U").charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <small>Compartida por</small>
                          <strong>
                            {receta.usuario || "Usuario desconocido"}
                          </strong>
                        </div>
                      </div>

                      {usuario &&
                        Number(usuario.id_usuario) ===
                          Number(receta.id_usuario) && (
                          <div className="recipe-owner-actions">
                            <button
                              className="recipe-edit-button"
                              onClick={() => editarReceta(receta)}
                            >
                              Editar
                            </button>

                            <button
                              className="recipe-delete-button"
                              onClick={() => eliminarReceta(receta.id_receta)}
                            >
                              Eliminar
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                </article>
              </div>
            ))
          )}
        </div>
      </div>

      {notificacion && (
        <div
          className={`app-toast app-toast-${notificacion.tipo}`}
          role="status"
          aria-live="polite"
        >
          <span className="app-toast-icon" aria-hidden="true">
            {notificacion.tipo === "error"
              ? "!"
              : notificacion.tipo === "info"
                ? "i"
                : "✓"}
          </span>
          <span>{notificacion.mensaje}</span>
          <button
            onClick={() => setNotificacion(null)}
            aria-label="Cerrar notificación"
          >
            ×
          </button>
        </div>
      )}

      {recetaSeleccionada && (
        <div
          className="recipe-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setRecetaSeleccionada(null);
            }
          }}
        >
          <article
            className="recipe-detail"
            role="dialog"
            aria-modal="true"
            aria-labelledby="recipe-detail-title"
          >
            <button
              className="recipe-detail-close"
              onClick={() => setRecetaSeleccionada(null)}
              aria-label="Cerrar receta"
              autoFocus
            >
              ×
            </button>

            <div className="recipe-detail-hero">
              {recetaSeleccionada.imagen ? (
                <img
                  src={`${API_URL}${recetaSeleccionada.imagen}`}
                  alt={recetaSeleccionada.titulo}
                />
              ) : (
                <div className="recipe-detail-fallback" aria-hidden="true">
                  <span>🍽️</span>
                </div>
              )}
              <div className="recipe-detail-hero-overlay"></div>
              <div className="recipe-detail-heading">
                <span>{recetaSeleccionada.categoria || "Sin categoría"}</span>
                <h2 id="recipe-detail-title">
                  {recetaSeleccionada.titulo}
                </h2>
                <div className="recipe-detail-meta">
                  <span>
                    ◷ {recetaSeleccionada.tiempo_preparacion || "Sin tiempo"}
                  </span>
                  <span>
                    Por {recetaSeleccionada.usuario || "Usuario desconocido"}
                  </span>
                </div>
              </div>
            </div>

            <div className="recipe-detail-body">
              {recetaSeleccionada.descripcion && (
                <p className="recipe-detail-intro">
                  {recetaSeleccionada.descripcion}
                </p>
              )}

              <div className="recipe-detail-columns">
                <section className="recipe-ingredients">
                  <span className="recipe-detail-number">01</span>
                  <h3>Ingredientes</h3>
                  <div>{recetaSeleccionada.ingredientes}</div>
                </section>

                <section className="recipe-preparation">
                  <span className="recipe-detail-number">02</span>
                  <h3>Preparación</h3>
                  <div>{recetaSeleccionada.preparacion}</div>
                </section>
              </div>

              <div className="recipe-detail-actions">
                {usuario && (
                  <button
                    className={`recipe-detail-favorite ${
                      favoritos.includes(
                        Number(recetaSeleccionada.id_receta),
                      )
                        ? "is-favorite"
                        : ""
                    }`}
                    onClick={() =>
                      alternarFavorito(recetaSeleccionada.id_receta)
                    }
                  >
                    {favoritos.includes(
                      Number(recetaSeleccionada.id_receta),
                    )
                      ? "♥ Guardada en favoritos"
                      : "♡ Guardar en favoritos"}
                  </button>
                )}

                {usuario &&
                  Number(usuario.id_usuario) ===
                    Number(recetaSeleccionada.id_usuario) && (
                    <button
                      className="recipe-detail-edit"
                      onClick={() => {
                        editarReceta(recetaSeleccionada);
                        setRecetaSeleccionada(null);
                        window.scrollTo({ top: 500, behavior: "smooth" });
                      }}
                    >
                      Editar esta receta
                    </button>
                  )}
              </div>
            </div>
          </article>
        </div>
      )}
    </div>
  );
}

export default App;
