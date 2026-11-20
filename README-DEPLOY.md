# AulaPlay — despliegue en Render

## GitHub
Sube el contenido de esta carpeta a la raíz de un repositorio GitHub (package.json, server.js, index.html, carpetas de juegos y render.yaml).

## Render
Crea un **New + > Web Service**, conecta el repositorio y configura:
- Runtime: Node
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/health`

El servidor escucha en `0.0.0.0` y utiliza `process.env.PORT` (Render asigna el puerto). Render proporciona HTTPS en el dominio `onrender.com`.
