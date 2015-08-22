function Event(result, handler) {
  this._result = result;
  this._handler = handler;
}

Event.prototype.fire = function(reactor) {
  this._handler(this._result, reactor);
}

module.exports = Event;