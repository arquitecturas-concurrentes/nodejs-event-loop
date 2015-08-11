var Reactor = function() {
  this.pendingTasks = [];
  this.active = true;
};

Reactor.prototype = {
  run: function() {
    while(this.isActive()) {
      runNext();
    }
  },

  runNext: function() {
    (this.pendingTasks.pop())(this);
  },

  doLater: function(task) {
    this.pendingTasks.push(task);
  },

  stop: function() {
    this.active = false;
  },

  isActive: function() {
    return this.active && this.hasPendingTasks();
  }

  hasPendingTasks: function() {
    return this.pendingTasks.size > 0;
  }
} 

new Reactor

