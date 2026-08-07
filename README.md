# recetas-web
Aplicación web de recetas de cocina con perfiles de usuario

## Tecnologías
- React
- Express.js
- Bootstrap
- GitHub

## Despliegue en Render

El repositorio incluye un `render.yaml` para crear automáticamente:

- El frontend como Static Site.
- El backend como Web Service.

La base PostgreSQL se aloja en Neon y las imágenes se guardan en Cloudinary.

### Pasos

1. Sube la rama que deseas publicar a GitHub.
2. En Render, selecciona **New > Blueprint**.
3. Conecta el repositorio `luismedinadl/recetas-web`.
4. Selecciona el archivo `render.yaml` y revisa los dos servicios.
5. Introduce `DATABASE_URL` con la conexión agrupada de Neon.
6. Introduce `CLOUDINARY_URL` con el valor de API Environment Variable de Cloudinary.
7. Pulsa **Deploy Blueprint**.
8. Cuando terminen los despliegues, abre `https://recetas-web-luismedina.onrender.com`.

La base de datos se prepara automáticamente al iniciar la API.

Usa la cadena **pooled** de Neon, que contiene `-pooler` en el hostname y los
parámetros `sslmode=require&channel_binding=require`. No publiques ninguna de
estas dos credenciales en GitHub.
