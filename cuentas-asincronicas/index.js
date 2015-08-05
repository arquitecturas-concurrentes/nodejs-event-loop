var cuentaOrigen = {monto:100};
cuentaOrigen.puedeDebitar = function(monto, cont) {
  setTimeout(function(){
    this.monto -= monto;
  }, Math.random() * 100);
}

var cuentaDestino = {monto: 100}
cuentaDestino.depositar = function(monto) {
  this.monto += monto;
}

var transferencia = {}
transferencia.ejecutar = function() {
  this.cuentaOrigen.puedeDebitar(this.monto, function(puede) {
    if(puede) {
      this.cuentaOrigen.debitar(this.monto, function() {
        this.cuentaDestino.depositar(this.monto);
      });
    }
  })
}
