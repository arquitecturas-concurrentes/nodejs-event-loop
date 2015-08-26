function IO(select) {
  this._select = select;
}

IO.prototype = {
  read: function(cont) {
    this._select.pushEvent("read-console", cont);
  }
}


module.exports = IO;
