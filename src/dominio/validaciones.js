// Reglas de una planta nueva como funciones puras, sin Mongoose (spec 04).
// Los mensajes son los mismos que los del modelo Planta, que sigue validando
// como segunda barrera.

const CAMPOS_TEXTO = [
  ["nombre", "El nombre es obligatorio"],
  ["especie", "La especie es obligatoria"],
  ["ubicacion", "La ubicación es obligatoria"],
];

const MENSAJES_INTERVALO = {
  obligatorio: "El intervalo de riego es obligatorio",
  entero: "El intervalo de riego debe ser un número entero de días",
  minimo: "El intervalo de riego debe ser de al menos 1 día",
};

// Un texto con solo espacios cuenta como vacío.
function estaVacio(valor) {
  return (
    valor === undefined ||
    valor === null ||
    (typeof valor === "string" && valor.trim() === "")
  );
}

function errorIntervalo(valor) {
  if (estaVacio(valor)) return MENSAJES_INTERVALO.obligatorio;
  // Solo números: un texto como "3" no es un número entero de días.
  if (typeof valor !== "number" || !Number.isInteger(valor)) {
    return MENSAJES_INTERVALO.entero;
  }
  if (valor < 1) return MENSAJES_INTERVALO.minimo;
  return null;
}

// Devuelve [{ campo, mensaje }] en el orden nombre, especie, ubicación e
// intervalo; la lista está vacía si la planta es válida.
function validarPlanta(datos) {
  const planta = datos ?? {};
  const detalles = [];
  for (const [campo, mensaje] of CAMPOS_TEXTO) {
    if (estaVacio(planta[campo])) detalles.push({ campo, mensaje });
  }
  const mensaje = errorIntervalo(planta.intervaloRiegoDias);
  if (mensaje) detalles.push({ campo: "intervaloRiegoDias", mensaje });
  return detalles;
}

module.exports = { validarPlanta };
