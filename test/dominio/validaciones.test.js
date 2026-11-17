const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const { validarPlanta } = require("../../src/dominio/validaciones");

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
