function doLater(action) {
  //action();
  //setTimeout(action, 0);
  setTimeout(action, Math.random() * 500);
}

function Cuenta(monto) {
  this._monto = monto;
}

Cuenta.prototype = {
  puedeExtraer: function(_monto, cont) {
    var self = this;
    doLater(function(){
      cont(self._monto >= _monto);
    });
  },
  extraer: function(_monto, cont) {
    var self = this;
    doLater(function() {
      self._monto -= _monto;
      cont();  
    });  
  },
  depositar: function(_monto, cont) {
    var self = this;
    doLater(function() {
      self._monto += _monto;
      cont()
    });
  },
  monto: function (cont) {
    var self = this;
    doLater(function() {
      cont(self._monto);
    });
  }
}

module.exports = Cuenta;

