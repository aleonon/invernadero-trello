// Reglas de formato de una planta nueva (spec 04) y de un riego (spec 05) como
// funciones puras, sin Mongoose. Los mensajes son los mismos que los de los
// modelos, que siguen validando como segunda barrera.

const { interpretarFecha, esFechaFutura } = require("./fechas");

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

const MENSAJES_RIEGO = {
  plantaObligatoria: "La planta es obligatoria",
  plantaNoValida: "La planta no tiene un identificador válido",
  cantidadObligatoria: "La cantidad de agua es obligatoria",
  cantidadEntera: "La cantidad de agua debe ser un número entero de mililitros",
  cantidadMinima: "La cantidad de agua debe ser mayor que 0",
  fechaNoValida: "La fecha no es válida",
  fechaFutura: "Un riego no puede tener fecha futura",
};

const ID_HEXADECIMAL = /^[0-9a-f]{24}$/i;

// Verdadero solo para un texto de 24 caracteres hexadecimales (spec 06).
function esIdValido(valor) {
  return typeof valor === "string" && ID_HEXADECIMAL.test(valor);
}

function errorPlantaDelRiego(valor) {
  if (estaVacio(valor)) return MENSAJES_RIEGO.plantaObligatoria;
  if (!esIdValido(valor)) return MENSAJES_RIEGO.plantaNoValida;
  return null;
}

function errorCantidad(valor) {
  if (estaVacio(valor)) return MENSAJES_RIEGO.cantidadObligatoria;
  // Solo números: un texto como "500" no es un número entero de mililitros.
  if (typeof valor !== "number" || !Number.isInteger(valor)) {
    return MENSAJES_RIEGO.cantidadEntera;
  }
  if (valor < 1) return MENSAJES_RIEGO.cantidadMinima;
  return null;
}

// Vacía es válida: el modelo pone la fecha de hoy.
function errorFecha(valor, ahora) {
  if (estaVacio(valor)) return null;
  const valida =
    valor instanceof Date ||
    typeof valor === "string" ||
    typeof valor === "number";
  if (!valida) return MENSAJES_RIEGO.fechaNoValida;
  // "AAAA-MM-DD" se lee en hora local; el resto se convierte como en Mongoose.
  const interpretada = interpretarFecha(valor);
  const fecha =
    interpretada instanceof Date ? interpretada : new Date(interpretada);
  if (Number.isNaN(fecha.getTime())) return MENSAJES_RIEGO.fechaNoValida;
  if (esFechaFutura(fecha, ahora)) return MENSAJES_RIEGO.fechaFutura;
  return null;
}

// Devuelve [{ campo, mensaje }] en el orden planta, cantidad y fecha; la lista
// está vacía si el formato es válido. La regla de «no anterior al registro de
// la planta» necesita la base de datos y sigue en la ruta.
function validarRiego(datos, ahora = new Date()) {
  const riego = datos ?? {};
  const detalles = [];
  const comprobaciones = [
    ["planta", errorPlantaDelRiego(riego.planta)],
    ["cantidadMl", errorCantidad(riego.cantidadMl)],
    ["fecha", errorFecha(riego.fecha, ahora)],
  ];
  for (const [campo, mensaje] of comprobaciones) {
    if (mensaje) detalles.push({ campo, mensaje });
  }
  return detalles;
}

module.exports = { esIdValido, validarPlanta, validarRiego };
