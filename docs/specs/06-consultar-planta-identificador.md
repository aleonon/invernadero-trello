- **Historia:** HU-1.4 · Historial de riegos (apoyo). Hoy el frontend recibe los datos de la planta desde la lista; con este endpoint, el detalle puede pedirlos solo.
- **Objetivo:** `GET /api/plantas/:id` devuelve una planta, con los mismos errores que el historial de riegos.

### Reglas

- **DEBE** agregar `esIdValido(valor)` a `src/dominio/validaciones.js`: verdadero solo para 24 caracteres hexadecimales.
- **DEBE** crear `GET /api/plantas/:id`: 400 con `{ campo: "id", mensaje: "La planta no tiene un identificador válido" }` si el id no es válido, 404 con `{ "error": "Planta no encontrada" }` si no existe y 200 con la planta si existe.
- **DEBE** usar `esIdValido` también en `GET /api/plantas/:id/riegos`, en lugar de la comprobación actual.
- **NO DEBE** cambiar el frontend en esta spec.

### Criterios de aceptación

- **CA-06.1:** DADO `"665f1c2a9b1e8a0012345678"`, CUANDO se comprueba, ENTONCES `esIdValido` es verdadero; con `"123"`, `""` o `null`, falso.
- **CA-06.2:** DADO una planta registrada, CUANDO se pide por su id, ENTONCES responde 200 con sus datos.
- **CA-06.3:** DADO un id con formato válido que no existe, CUANDO se pide, ENTONCES responde 404.
- **CA-06.4:** DADO el id `abc`, CUANDO se pide la planta o su historial, ENTONCES los dos responden 400 con el mismo detalle.

### Verificación

| Criterio | Cómo se comprueba |
| --- | --- |
| CA-06.1 | Tests en `test/dominio/validaciones.test.js` |
| CA-06.2 a CA-06.4 | curl a la API |

### Archivos

`src/dominio/validaciones.js` · `test/dominio/validaciones.test.js` · `src/routes/plantas.js`

### Pendientes

- CA-06.2 no se comprobó con curl: la base de datos no tiene ninguna planta y no se registró una de prueba, porque la API no permite borrarla después. Se comprobó arrancando `app` con `Planta.findById` sustituido: responde 200 con los datos de la planta. Para cerrarlo con curl: registrar una planta con `POST /api/plantas` y pedir `GET /api/plantas/<id>`.
- CA-06.3 y CA-06.4 se comprobaron con curl contra la API: un id válido que no existe responde 404, y `abc` responde 400 con el mismo detalle en `/api/plantas/abc` y en `/api/plantas/abc/riegos`.
- Faltan tests automáticos de las rutas, como en las specs 04 y 05.
- El frontend todavía no usa `GET /api/plantas/:id`: el detalle sigue recibiendo la planta desde la lista (la spec prohíbe tocar `client/`).
