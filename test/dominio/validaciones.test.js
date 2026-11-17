const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const {
  esIdValido,
  validarPlanta,
  validarRiego,
} = require("../../src/dominio/validaciones");

function datosValidos() {
  return {
    nombre: "Mandrágora",
    especie: "Mandragora officinarum",
    ubicacion: "Mesa 2",
    intervaloRiegoDias: 3,
  };
}

const ENTERO = "El intervalo de riego debe ser un número entero de días";
const AL_MENOS_UNO = "El intervalo de riego debe ser de al menos 1 día";

describe("validarPlanta", () => {
  test("CA-04.1: una planta con los cuatro datos y un intervalo de 3 es válida", () => {
    assert.deepEqual(validarPlanta(datosValidos()), []);
  });

  test("CA-04.2: sin especie y con intervalo 0 devuelve dos detalles, en orden", () => {
    const datos = { ...datosValidos(), intervaloRiegoDias: 0 };
    delete datos.especie;
    assert.deepEqual(validarPlanta(datos), [
      { campo: "especie", mensaje: "La especie es obligatoria" },
      { campo: "intervaloRiegoDias", mensaje: AL_MENOS_UNO },
    ]);
  });

  test("CA-04.3: un nombre con solo espacios es obligatorio", () => {
    assert.deepEqual(validarPlanta({ ...datosValidos(), nombre: "   " }), [
      { campo: "nombre", mensaje: "El nombre es obligatorio" },
    ]);
  });

  for (const intervalo of [2.5, "tres"]) {
    test(`CA-04.4: rechaza el intervalo ${JSON.stringify(intervalo)}`, () => {
      assert.deepEqual(
        validarPlanta({ ...datosValidos(), intervaloRiegoDias: intervalo }),
        [{ campo: "intervaloRiegoDias", mensaje: ENTERO }],
      );
    });
  }

  test("acepta un intervalo de 1 día", () => {
    assert.deepEqual(
      validarPlanta({ ...datosValidos(), intervaloRiegoDias: 1 }),
      [],
    );
  });

  test("rechaza un intervalo negativo", () => {
    assert.deepEqual(
      validarPlanta({ ...datosValidos(), intervaloRiegoDias: -2 }),
      [{ campo: "intervaloRiegoDias", mensaje: AL_MENOS_UNO }],
    );
  });

  test("rechaza un intervalo escrito como texto aunque sea un entero", () => {
    assert.deepEqual(
      validarPlanta({ ...datosValidos(), intervaloRiegoDias: "3" }),
      [{ campo: "intervaloRiegoDias", mensaje: ENTERO }],
    );
  });

  for (const intervalo of [undefined, null, "", "  "]) {
    test(`un intervalo ${JSON.stringify(intervalo)} es obligatorio`, () => {
      assert.deepEqual(
        validarPlanta({ ...datosValidos(), intervaloRiegoDias: intervalo }),
        [
          {
            campo: "intervaloRiegoDias",
            mensaje: "El intervalo de riego es obligatorio",
          },
        ],
      );
    });
  }

  for (const [campo, mensaje] of [
    ["nombre", "El nombre es obligatorio"],
    ["especie", "La especie es obligatoria"],
    ["ubicacion", "La ubicación es obligatoria"],
  ]) {
    test(`rechaza una planta sin ${campo}`, () => {
      const datos = datosValidos();
      delete datos[campo];
      assert.deepEqual(validarPlanta(datos), [{ campo, mensaje }]);
    });

    test(`rechaza ${campo} nulo`, () => {
      assert.deepEqual(validarPlanta({ ...datosValidos(), [campo]: null }), [
        { campo, mensaje },
      ]);
    });
  }

  test("devuelve los cuatro detalles en el orden nombre, especie, ubicación e intervalo", () => {
    const detalles = validarPlanta({
      intervaloRiegoDias: 2.5,
      ubicacion: "",
      especie: " ",
    });
    assert.deepEqual(
      detalles.map((d) => d.campo),
      ["nombre", "especie", "ubicacion", "intervaloRiegoDias"],
    );
  });

  for (const datos of [undefined, null]) {
    test(`trata ${datos} como una planta sin datos`, () => {
      assert.equal(validarPlanta(datos).length, 4);
    });
  }
});

describe("validarRiego", () => {
  // Las fechas se construyen en hora local para que los tests no dependan de TZ.
  const ahora = new Date(2026, 9, 28, 10, 0);
  const PLANTA = "665f1c2a9b1e8a0012345678";

  const CANTIDAD_ENTERA =
    "La cantidad de agua debe ser un número entero de mililitros";
  const CANTIDAD_MAYOR_QUE_0 = "La cantidad de agua debe ser mayor que 0";
  const FECHA_FUTURA = "Un riego no puede tener fecha futura";

  function riegoValido() {
    return { planta: PLANTA, cantidadMl: 500 };
  }

  test("CA-05.1: una planta válida y 500 ml sin fecha es válido", () => {
    assert.deepEqual(validarRiego(riegoValido(), ahora), []);
  });

  for (const [cantidadMl, mensaje] of [
    [0, CANTIDAD_MAYOR_QUE_0],
    [-5, CANTIDAD_MAYOR_QUE_0],
    [2.5, CANTIDAD_ENTERA],
  ]) {
    test(`CA-05.2: una cantidad de ${cantidadMl} ml da «${mensaje}»`, () => {
      assert.deepEqual(validarRiego({ ...riegoValido(), cantidadMl }, ahora), [
        { campo: "cantidadMl", mensaje },
      ]);
    });
  }

  test("CA-05.3: la fecha de mañana es futura", () => {
    const manana = new Date(2026, 9, 29, 9, 0);
    assert.deepEqual(validarRiego({ ...riegoValido(), fecha: manana }, ahora), [
      { campo: "fecha", mensaje: FECHA_FUTURA },
    ]);
  });

  test("CA-05.4: hoy a las 23:59 con ahora a las 00:01 no es futura", () => {
    const fecha = new Date(2026, 9, 28, 23, 59);
    const temprano = new Date(2026, 9, 28, 0, 1);
    assert.deepEqual(validarRiego({ ...riegoValido(), fecha }, temprano), []);
  });

  test('CA-05.5: una planta "123" no tiene un identificador válido', () => {
    assert.deepEqual(validarRiego({ ...riegoValido(), planta: "123" }, ahora), [
      {
        campo: "planta",
        mensaje: "La planta no tiene un identificador válido",
      },
    ]);
  });

  for (const planta of [undefined, null, "", "   "]) {
    test(`una planta ${JSON.stringify(planta)} es obligatoria`, () => {
      assert.deepEqual(validarRiego({ ...riegoValido(), planta }, ahora), [
        { campo: "planta", mensaje: "La planta es obligatoria" },
      ]);
    });
  }

  for (const planta of ["665f1c2a9b1e8a001234567z", 12345, { id: PLANTA }]) {
    test(`rechaza la planta ${JSON.stringify(planta)}`, () => {
      assert.deepEqual(
        validarRiego({ ...riegoValido(), planta }, ahora).map((d) => d.campo),
        ["planta"],
      );
    });
  }

  test("acepta un identificador en mayúsculas", () => {
    assert.deepEqual(
      validarRiego({ ...riegoValido(), planta: PLANTA.toUpperCase() }, ahora),
      [],
    );
  });

  for (const cantidadMl of [undefined, null, ""]) {
    test(`una cantidad ${JSON.stringify(cantidadMl)} es obligatoria`, () => {
      assert.deepEqual(validarRiego({ ...riegoValido(), cantidadMl }, ahora), [
        { campo: "cantidadMl", mensaje: "La cantidad de agua es obligatoria" },
      ]);
    });
  }

  test("rechaza una cantidad escrita como texto aunque sea un entero", () => {
    assert.deepEqual(
      validarRiego({ ...riegoValido(), cantidadMl: "500" }, ahora),
      [{ campo: "cantidadMl", mensaje: CANTIDAD_ENTERA }],
    );
  });

  for (const fecha of [null, ""]) {
    test(`acepta una fecha ${JSON.stringify(fecha)} como vacía`, () => {
      assert.deepEqual(validarRiego({ ...riegoValido(), fecha }, ahora), []);
    });
  }

  test("acepta la fecha de hoy escrita como AAAA-MM-DD", () => {
    assert.deepEqual(
      validarRiego({ ...riegoValido(), fecha: "2026-10-28" }, ahora),
      [],
    );
  });

  test("rechaza mañana escrita como AAAA-MM-DD", () => {
    assert.deepEqual(
      validarRiego({ ...riegoValido(), fecha: "2026-10-29" }, ahora),
      [{ campo: "fecha", mensaje: FECHA_FUTURA }],
    );
  });

  test("acepta una fecha pasada", () => {
    assert.deepEqual(
      validarRiego({ ...riegoValido(), fecha: "2020-01-15" }, ahora),
      [],
    );
  });

  for (const fecha of ["no es una fecha", "2026-13-45T99:00", true, {}]) {
    test(`rechaza la fecha ${JSON.stringify(fecha)}`, () => {
      assert.deepEqual(validarRiego({ ...riegoValido(), fecha }, ahora), [
        { campo: "fecha", mensaje: "La fecha no es válida" },
      ]);
    });
  }

  test("devuelve los detalles en el orden planta, cantidad y fecha", () => {
    const detalles = validarRiego(
      { fecha: "2026-10-29", cantidadMl: 0, planta: "123" },
      ahora,
    );
    assert.deepEqual(
      detalles.map((d) => d.campo),
      ["planta", "cantidadMl", "fecha"],
    );
  });

  for (const datos of [undefined, null]) {
    test(`trata ${datos} como un riego sin planta ni cantidad`, () => {
      assert.deepEqual(
        validarRiego(datos, ahora).map((d) => d.campo),
        ["planta", "cantidadMl"],
      );
    });
  }
});

describe("esIdValido", () => {
  test('CA-06.1: "665f1c2a9b1e8a0012345678" es un identificador válido', () => {
    assert.equal(esIdValido("665f1c2a9b1e8a0012345678"), true);
  });

  for (const valor of ["123", "", null]) {
    test(`CA-06.1: ${JSON.stringify(valor)} no es un identificador válido`, () => {
      assert.equal(esIdValido(valor), false);
    });
  }

  test("acepta un identificador en mayúsculas", () => {
    assert.equal(esIdValido("665F1C2A9B1E8A0012345678"), true);
  });

  for (const valor of [
    "665f1c2a9b1e8a001234567",
    "665f1c2a9b1e8a00123456789",
    "665f1c2a9b1e8a001234567z",
    " 665f1c2a9b1e8a0012345678 ",
    "abc",
    undefined,
    123456789012345678901234,
    { id: "665f1c2a9b1e8a0012345678" },
  ]) {
    test(`rechaza ${JSON.stringify(valor)}`, () => {
      assert.equal(esIdValido(valor), false);
    });
  }
});
