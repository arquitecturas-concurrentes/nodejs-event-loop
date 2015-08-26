function Timer(timeout, handler) {
  this._timeout = timeout;
  this._handler = handler;
}

Timer.prototype = {
  expired: function(clock) {
    return clock.now().after(this._timeout);
  },

  fire: function(reactor) {
    this._handler(reactor);
  }
}

module.exports = Timer;
