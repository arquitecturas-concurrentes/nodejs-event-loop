function IOQueue(select) {
  this._select = select;
}
IOQueue.prototype = {
  hasPendingWorkUnits: function() {
    return this._select.hasPendingEvents();
  },

  processWorkUnits: function() {
    while (this._select.hasAvailableEvents()) {
      var event = this._select.nextEvent();
      event.fire(this);
    }
  }
}

module.exports = IOQueue;