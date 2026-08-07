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
- Una base de datos PostgreSQL.

### Pasos

1. Sube la rama que deseas publicar a GitHub.
2. En Render, selecciona **New > Blueprint**.
3. Conecta el repositorio `luismedinadl/recetas-web`.
4. Selecciona el archivo `render.yaml` y revisa los tres recursos.
5. Pulsa **Deploy Blueprint**.
6. Cuando terminen los despliegues, abre `https://recetas-web-luismedina.onrender.com`.

La base de datos se prepara automáticamente al iniciar la API.

### Importante sobre el plan gratuito

Los archivos subidos al Web Service se almacenan temporalmente. En una instancia
gratuita de Render, las imágenes pueden perderse cuando el servicio se reinicia,
se suspende o vuelve a desplegarse. Para conservarlas de forma permanente se
debe usar un disco persistente de pago o un servicio externo de almacenamiento.

Render permite una sola base PostgreSQL gratuita por workspace y actualmente
las bases gratuitas expiran después de 30 días. Si el workspace ya tiene una,
selecciona una base existente o cambia el plan durante la creación del Blueprint.
