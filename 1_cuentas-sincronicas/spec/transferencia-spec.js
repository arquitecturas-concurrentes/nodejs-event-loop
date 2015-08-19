var assert = require("assert");

var Transferencia = require("../src/transferencia");
var Cuenta = require("../src/cuenta");

describe("Transferencia", function() {
  it("incrementa el destino y decrementa el origen", function() {
    var origen = new Cuenta(100);
    var destino = new Cuenta(100);

    var tx1 = new Transferencia(origen, destino, 30);
    tx1.ejecutar();

    assert.equal(origen.monto, 70);
    assert.equal(destino.monto, 130);
  }) 
});