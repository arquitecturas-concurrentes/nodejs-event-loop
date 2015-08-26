var Event = require('./event')

function FakeSelect() {
  this._availableEvents = [];
}

FakeSelect.prototype = {
  pushEvent: function(_event, handler) {
    this._availableEvents.push(new Event("hola", handler));
  },
  nextEvent: function() {
    return this._availableEvents.pop();
  },
  hasAvailableEvents: function() {
    return this._availableEvents.length > 0;
  },
  hasPendingEvents: function() {
    return this.hasAvailableEvents();
  }
}

module.exports = FakeSelect;
