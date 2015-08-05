var cuentaOrigen = {monto:100};
cuentaOrigen.puedeDebitar = function(monto) {
  return this.monto >= monto
}
cuentaOrigen.debitar = function(monto) {
  this.monto -= monto;
}

var cuentaDestino = {monto: 100}
cuentaDestino.depositar = function(monto) {
  this.monto += monto;
}

var transferencia = {}
transferencia.ejecutar = function() {
  if (this.cuentaOrigen.puedeDebitar(this.monto)) {
    this.cuentaOrigen.debitar(this.monto);
    this.cuentaDestino.depositar(this.monto);
  }
}


var transferencia2 = Object.create(transferencia);
var transferencia3 = Object.create(transferencia);

transferencia.ejecutar();
transferencia2.ejecutar();
transferencia3.ejecutar();

