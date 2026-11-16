---
name: tablero
description: Carga las tarjetas de docs/tablero/tarjetas.md en el tablero de Trello «Invernadero Encantado», con sus listas y en orden de prioridad, sin duplicar lo que ya existe. Usar solo cuando el usuario invoque /tablero.
argument-hint: "[ruta del archivo de tarjetas]"
disable-model-invocation: true
---

# /tablero · Cargar las tarjetas en Trello

Sincroniza un archivo de tarjetas en Markdown con un tablero de Trello mediante el servidor MCP `trello` (`.mcp.json`). El archivo manda sobre lo que se **crea**; nunca se borra ni se archiva nada en Trello.

Archivo de entrada: `$ARGUMENTS` si se indica; si no, `docs/tablero/tarjetas.md`.

## 1. Leer el archivo

1. Lee el archivo completo. Si no existe o no tiene tarjetas, detente y dilo.
2. **Nombre del tablero:** el texto entre « » del título `# ` (p. ej. `Invernadero Encantado`). Si no hay comillas, usa el título entero.
3. **Tarjetas:** cada bloque que empieza con `## ` hasta el siguiente `## ` o el final del archivo.
   - **Título:** el texto de la línea `## `, tal cual (incluido el `·`).
   - **Lista:** el valor de la línea `Lista:` que sigue al título. Si falta, la tarjeta es inválida: avísalo y sáltala.
   - **Descripción:** todo lo que queda del bloque, sin la línea `Lista:` y sin líneas en blanco al principio ni al final. Se copia en Markdown, sin reescribirla.
   - **Criterios:** si el bloque tiene una sección `### Criterios de aceptación`, cada viñeta de esa sección es un criterio (texto completo, sin el `- `).
4. El orden de las tarjetas dentro de cada lista es el orden del archivo. En «Por hacer» ese orden es la prioridad: la primera va arriba.

## 2. Preparar el tablero

1. Identifica al usuario con `trelloReadMember` (`action: "get_me"`).
2. Busca un tablero abierto con el nombre exacto del paso 1.2 (`trelloSearch` o `trelloReadBoard`).
   - **Uno:** úsalo.
   - **Varios:** pregunta al usuario cuál usar.
   - **Ninguno:** se creará en el paso 3, tras la confirmación.
3. Lee las listas abiertas del tablero y todas sus tarjetas abiertas (título, lista, posición).

## 3. Mostrar el plan y confirmar

Antes de escribir nada en Trello, muestra un resumen y pide confirmación:

- Si se va a crear el tablero.
- Listas que faltan y se van a crear.
- Tarjetas nuevas, agrupadas por lista y en orden.
- Tarjetas que ya existen (mismo título, sin distinguir mayúsculas ni espacios sobrantes) y se dejan como están. Si una está en otra lista o su descripción cambió, señálalo, pero **no la muevas ni la edites** salvo que el usuario lo pida expresamente.
- Tarjetas inválidas que se saltan.

Si no hay nada que crear, dilo y termina sin escribir.

## 4. Escribir en Trello

Solo tras la confirmación:

1. **Tablero:** si falta, créalo con `trelloWriteBoard`, sin listas por defecto si la herramienta lo permite. Si Trello crea listas por defecto que no están en el archivo, no las borres; menciónalas en el informe.
2. **Listas:** crea con `trelloWriteList` las que falten, con `pos` enteros consecutivos en este orden: `Backlog`, `Por hacer`, cualquier otra lista del archivo en el orden en que aparece, y `Hecho` al final. No renombres, muevas ni archives listas existentes.
3. **Tarjetas:** crea con `trelloWriteCard` solo las nuevas, con su título y descripción, y `pos` enteros consecutivos (1, 2, 3, …) por lista según el orden del archivo. Si la lista ya tenía tarjetas, colócalas debajo de las existentes. No pongas fechas, miembros ni etiquetas.
4. **Checklist:** en cada tarjeta nueva con criterios, crea con `trelloWriteChecklist` una checklist «Criterios de aceptación» con un elemento por criterio, en orden y sin marcar. No toques las checklists de tarjetas que ya existían.

Si una llamada falla, no reintentes a ciegas: sigue con el resto y anota el fallo para el informe.

## 5. Informe final

Responde en español, breve:

- Enlace al tablero.
- Cuántas listas y tarjetas se crearon, cuántas ya existían y cuántas fallaron o se saltaron, con sus títulos.
- Diferencias detectadas entre el archivo y Trello en tarjetas existentes (lista o descripción), sin haberlas cambiado.
- Cualquier fecha u hora, en la zona horaria del usuario (`prefs.timezone` de `get_me`), con el año primero y el nombre de la zona.

## Reglas

- Nunca borrar, archivar ni mover tarjetas, listas o tableros, salvo petición expresa del usuario.
- Nunca leer `.env` ni escribir credenciales: la autenticación la gestiona el servidor MCP.
- No modificar el archivo de tarjetas ni ningún archivo del repositorio.
- Las tarjetas «sin spec» del Backlog se cargan igual, pero son solo registro: cargarlas no autoriza a implementarlas (ver `AGENTS.md`).
