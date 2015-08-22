var Timer = require("../timer.js");

function TimersQueue(clock) {
  this._clock = clock;
  this._timers = [];
}
TimersQueue.prototype = {
  hasPendingWorkUnits: function() {
    return this._timers.length > 0
  },

  processWorkUnits: function() {
    while(this.hasPendingWorkUnits() && this._timers[0].expired(this._clock)) {
      var timer = this._timers.pop();
      timer.fire(this);
    }
  },

  pushTimer: function(timeout, handler) {
    this._timers.push(
      new Timer(
        this._clock.now().plus(timeout),
        handler))
  }
}

module.exports = TimersQueue;