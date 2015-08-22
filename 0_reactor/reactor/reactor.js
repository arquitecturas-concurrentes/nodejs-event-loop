function Reactor(workQueues) {
  this._stopped = true;
  this._workQueues = workQueues;
}
Reactor.prototype = {
  run: function() {
    this.withinRun(function() {
      while (this.hasPendingWorkUnits()) {
        this.processWorkUnits();
      }      
    });
  },

  hasPendingWorkUnits: function() {
    return this._workQueues.some(function(queue){
      return queue.hasPendingWorkUnits();
    });
  },

  processWorkUnits: function() {
    return this._workQueues.forEach(function(queue){
      return queue.processWorkUnits();
    });
  },

  withinRun: function(action) {
    this._stopped = false;
    try {
      action.call(this);      
    } finally {
      this._stopped = true;
    }
  },

  isStopped: function() {
    return this._stopped;
  }
}

module.exports = Reactor;
